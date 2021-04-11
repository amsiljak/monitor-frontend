import request, { authEndpoint } from "../../service";

export const checkPassword = ({ password }) => {

    const data = {
        password: password
    };
    //kad se deploya ide ruta (authEndpoint + '/checkPassword')
    return request(authEndpoint + "/checkPassword", "POST",
        data
    ).then(res => {
        if (res && res.status === 200) {
            return res;
        }
    }).catch(
        err => {
            console.log(err);
        }
    );


}