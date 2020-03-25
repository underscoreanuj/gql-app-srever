import * as connectRedis from 'connect-redis';
import 'dotenv/config';
import * as RateLimit from 'express-rate-limit';
import * as session from 'express-session';
import { GraphQLServer } from 'graphql-yoga';
import * as passport from 'passport';
import { Strategy } from 'passport-github2';
import * as RedisStoreRateLimit from 'rate-limit-redis';
import 'reflect-metadata';
import { REDIS_SESSION_PREFIX } from './constants';
import { User } from './entity/User';
import { redis } from './redis';
import { confirmEmail } from './routes/confirmEmail';
import { createTypeORMConn } from './utils/CreateTypeORMConn';
import { genSchema } from './utils/genSchema';

const RedisStore = connectRedis(session);

export const startServer = async () => {
	const server = new GraphQLServer({
		schema: genSchema(),
		context: ({ request }) => ({
			redis,
			url: request.protocol + '://' + request.get('host'),
			session: request.session,
			req: request
		})
	});

	server.express.use(RateLimit({
		store: new RedisStoreRateLimit({ client: redis }),
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // limit each IP to 100 requests per windowMs
		message: 'Too many requests from this IP, try again after some time' // message to deliver upon reaching limit
	}));

	server.express.use(session({
		store: new RedisStore({ client: redis, prefix: REDIS_SESSION_PREFIX }),
		name: 'gqlid',
		secret: process.env.SESSION_SECRET as string,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
		}
	}));

	const cors = {
		credentials: true,
		origin: process.env.NODE_ENV === 'test'
			? '*'
			: (process.env.FRONTEND_HOST as string)
	};

	const connection = await createTypeORMConn();

	passport.use(new Strategy({
		clientID: process.env.GITHUB_CLIENT_ID as string,
		clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
		callbackURL: 'http://localhost:4000/auth/github/callback',
		scope: ['user:email']
	}, async (_: any, __: any, profile: any, cb: any) => {
		// console.log('profile: ', profile);
		// console.log('accessToken: ', accessToken);
		// console.log('refreshToken: ', refreshToken);
		// console.log('cb: ', cb);

		const { id, emails } = profile;

		const query = connection
			.getRepository(User)
			.createQueryBuilder('user')
			.where('user.githubId = :id', { id });

		let email: string | null = null;

		// if email is found, check by it too
		if (emails) {
			email = emails[0].value;
			query.orWhere('user.email = :email', { email });
		}

		let user = await query.getOne();

		// user needs to register
		if (!user) {
			// create user
			user = await User.create({ githubId: id, email }).save();
		} else if (!user.githubId) {
			// merge accounts
			// we found user by email  (user has an account by the same email but did not login with github before)
			user.githubId = id;
			user.save();
		} else {
			// we have a github id (normal login attempt)
		}

		return cb(null, { id: user.id });
	}));

	server.express.use(passport.initialize());

	server.express.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

	server.express.get('/auth/github/callback', passport.authenticate('github', {
		failureRedirect: '/login',
		session: false
	}), (req, res) => {
		// Successful authentication, redirect home.
		(req.session as any).userId = (req.user as any).id;
		// console.log('req: ', req);

		// TODO: redirect to frontend
		res.redirect('/');
	});

	server.express.get('/confirm/:id', confirmEmail);

	const app = await server.start({
		cors,
		port: process.env.NODE_ENV === 'test'
			? 0
			: 4000
	});
	console.log('Server is running on localhost:4000');

	return app;
};
