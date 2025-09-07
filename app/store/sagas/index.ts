/**
 *  Redux saga class init
 */
import { takeEvery, all } from 'redux-saga/effects';
import * as types from '../actions/types';
import { settingsSagas } from "app/store/sagas/SettingsSaga";
import { AuthSagas } from "app/screens/Auth/saga";

export default function* watch() {
  yield all([
      settingsSagas(),
      AuthSagas()
  ])
}
