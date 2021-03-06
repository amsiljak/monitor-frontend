import { connect } from "react-redux";
import React, { useEffect } from 'react';
import './MyProfile.scss';
import { push } from 'connected-react-router';
import { RouteLink } from "../../store/modules/menu/menu";
import { verifyEmail } from "./VerifyEmail";

function EmailVerification() {
    const pathname = window.location.pathname; 

    const data = {
        token: pathname.substring(pathname.lastIndexOf('/') + 1),
    }

    useEffect(() => {
        verifyEmail(data);
    }, [verifyEmail])
    
    return (
        <div className="formDiv">
            <h3>Email verification</h3>
        </div>
    );
}
export default connect(state => ({}), { push })(EmailVerification);