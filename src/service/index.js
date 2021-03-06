import axios from "axios";
import { STORAGE_KEY } from "../utils/consts";
import { history } from "../store/store";
import { merge } from "lodash";
import { showSwalToast } from "../utils/utils";

export const endpoint = 'https://si-2021.167.99.244.168.nip.io/api';
//export const wsEndpoint = 'http://109.237.39.237:25565/api'
export const wsEndpoint = 'https://si-grupa5.herokuapp.com/api';
export const authEndpoint = 'https://si-2021.167.99.244.168.nip.io:3333';
export const forgotPassword = 'https://si-2021.167.99.244.168.nip.io:3333/forgotPassword';
export const resetPassword = 'https://si-2021.167.99.244.168.nip.io:3333/changePassword';
export const userSecurityQuestions = 'https://si-2021.167.99.244.168.nip.io:3333/User/AllQuestions';
export const answerCheck = 'https://si-2021.167.99.244.168.nip.io:3333/answerCheck';
export const devices = `${endpoint}/device`
export const groups = `${endpoint}/group`
export const users = `${endpoint}/user`
export const userTasks = `${endpoint}/UserTasks/All`
export const userTaskTrackers = `${endpoint}/UserTasks/Tracker`
export const errors = `${endpoint}/error`
export const roles = `${endpoint}/role`

const getErrorMessage = (response) => {

    const data = response?.data;

    return data?.message || data?.title || response?.statusText || "Došlo je do greške."
}

const request = async (
    url = '',
    method = 'get',
    data = {},
    aditionalHeaders = {}
) => {

    let defaultConfig = {
        headers: {
            Accept: "application/json",
            // "Content-Type": 'application/json'
        }
    };

    const token = localStorage.getItem(STORAGE_KEY);

    if (token) {
        defaultConfig.headers.Authorization = "Bearer " + token;
    }

    const params = {
        url,
        method,
        data,
        headers: aditionalHeaders
    }

    const fullConfig = merge(defaultConfig, params);

    return new Promise((resolve, reject) => {
        return axios.request(fullConfig)
            .then(r => {

                if (r?.data?.newAccessToken) {      // refresh token ( TODO, this must be more secure )
                    localStorage.setItem(STORAGE_KEY, r?.data?.newAccessToken);
                }

                resolve(r);
            })
            .catch(ex => {

                const response = ex.response;

                if (response && response.status === 401) {
                    removeAllData();
                }

                const errMessage = getErrorMessage(response);

                showSwalToast(errMessage)

                reject(ex);
            })
    });
};

const removeAllData = () => {
    window.localStorage.clear();
    history.push('/login');
}

export default request;
