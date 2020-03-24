import * as yup from "yup";
import {passwordNotLongEnough} from "../modules/register/errorMessages";

export const passwordValidator = yup.string().min(6, passwordNotLongEnough).max(255);
