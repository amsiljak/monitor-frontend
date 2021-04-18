import React, {useEffect, useState} from "react";
import { connect } from "react-redux";
import { TextField, MenuItem } from '@material-ui/core';
import { showSwalToast } from "../../utils/utils";
import { RouteLink } from "../../store/modules/menu/menu";
import { push } from "connected-react-router";
import {AsyncButton} from "../AsyncButton/AsyncButton";
import "../ManageDeviceForm/ManageDeviceForm.scss"
import validator from "validator/es";
import request, { roles, users } from "../../service";
import { fetchAllGroups, setGroupsAsync } from "../../store/modules/groups/actions";
import { cloneDeep } from "lodash";
import { selectUser } from "../../store/modules/users/actions";

const MangeUserForm = ({ selectedUser, push, groupOptions, fetchAllGroups, selectUser}) => {
  
    const initialValues = {
        name: "",
        lastname: "",
        email: "",
        phone: "",
        password: "",
        passwordRepeat: "",
        roleId: "",
        groupId: ""
    }

    const [editMode, setEditMode] = useState(false);
    const [values, setValues] = useState(initialValues)
    const [errors, setErrors] = useState({})
    const [allRoles, setAllRoles] = useState([])

    const fetchRoles = () => {
        request(roles + `/GetRoles`, 'GET')
            .then(response => response.data)
            .then(r => {
                console.log(r.data)
                setAllRoles(r.data)
            })
    }

    const transformUserToForm = (user) => {

        const form = cloneDeep(user);

        form.name = user.name;
        form.lastname = user.lastname;
        form.email = user.email;
        form.phone = user.phone;
        // form.password = user.password;
        // form.passwordRepeat = user.password;
        form.password = "";         // temp
        form.passwordRepeat = "";   // temp
        form.roleId = user.roleId;
        form.groupId = user.groupId;
        return form;
    }

    
    const transformFormToUser = (form) => {
        return {
            Name: form.name ?? '',
            LastName: form.lastname ?? '',
            Email: form.email ?? '',
            Phone: form.phone ?? '',
            Password: form.password ?? '',
            RoleId: form.roleId,
            GroupId: form.groupId
        }
    }

    useEffect(() => {
        fetchRoles();
    }, [])


    useEffect( () => {
        if (!groupOptions?.length) {
            fetchAllGroups();
        }
        if (selectedUser) {
            console.log(selectedUser)
            setValues(transformUserToForm(selectedUser));
        }
        setEditMode(Boolean(selectedUser));
        return () => {
            selectUser(null);
        }

    }, [selectedUser, fetchAllGroups, selectUser, groupOptions?.length])

 
    const validate = () => {
        let temp = {}
        let letterNumber = /^[0-9a-zA-Z]+$/
        const emptyFieldError = "Polje je obavezno"

        if (values.name === "")
            temp.name = emptyFieldError
        else if (!values.name.match(letterNumber) && !values.name.includes(" "))
            temp.name = "Polje smije sadržavati samo karaktere: A-Z, a-z, 0-9"
        else
            temp.name = ""

        if (values.lastname === "")
            temp.lastname = emptyFieldError
        else if (!values.lastname.match(letterNumber) && !values.lastname.includes(" "))
            temp.lastname = "Polje smije sadržavati samo karaktere: A-Z, a-z, 0-9"
        else
            temp.lastname = ""

        if (values.email === "")
            temp.email = emptyFieldError
        else if (!validator.isEmail(values.email))
            temp.email = "Pogrešan email"
        else
            temp.email = ""

        if (values.phone === "")
            temp.phone = emptyFieldError
        else if (!values.phone.match(/^\+{0,1}[0-9]{6}/) && !values.phone.includes(" "))
            temp.phone = "Polje mora sadržavati najmanje 6 cifri i može početi sa +"
        else
            temp.phone = ""

        temp.password = values.password ? "" : emptyFieldError
        temp.passwordRepeat = values.passwordRepeat ? "" : emptyFieldError
        if (!values.passwordRepeat.match(values.password)) {
            temp.passwordRepeat= "Polje nije saglasno sa poljem Šifra"
        }

        temp.roleId = values.roleId ? "" : emptyFieldError
        temp.groupId = values.groupId ? "" : emptyFieldError

        setErrors(temp)

        return Object.values(temp).every(x => x === "")
    }

    const handleInputChange = e => {
        const { name, value } = e.target
        setValues({
            ...values,
            [name]: value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const userData = transformFormToUser(values);

        console.log(userData);

        const userId = userData.UserId;

        delete userData.UserId;

        if (validate()) {

            // if (editMode === true) {
            //
            //     request(users + `/Update?userId=${userId}`, 'PUT', userData)
            //         .then(r => {
            //             console.log(r.data);
            //             showSwalToast(`Uspješno izmijenjen korisnik '${userData.Name}'`, 'success');
            //             setValues(initialValues);
            //         }).finally(() => {
            //         push(RouteLink.AdminPanel);
            //     })
            // } else {
            //
            //
            //     request(users + `/CreateNew?userId=${userId}`, 'POST', userData)
            //         .then(r => {
            //             console.log(r.data);
            //             showSwalToast(`Uspješno kreiran korisnik '${userData.Name}'`, 'success');
            //             setValues(initialValues);
            //         }).finally(() => {
            //         push(RouteLink.AdminPanel);
            //     })
            //
            // }
       }
    }

        return (
        <form className="manage-device-form" onSubmit={handleSubmit} >
            <TextField variant="outlined" label="Ime" name="name" value={values.name} onChange={handleInputChange}
                       {...(errors.name && { error: true, helperText: errors.name })} />

            <TextField variant="outlined" label="Prezime" name="lastname" value={values.lastname} onChange={handleInputChange}
                       {...(errors.lastname && { error: true, helperText: errors.lastname })} />

            <TextField variant="outlined" label="Email" name="email" value={values.email} onChange={handleInputChange}
                       {...(errors.email && { error: true, helperText: errors.email })} />

            <TextField variant="outlined" label="Broj telefona" name="phone" value={values.phone} onChange={handleInputChange}
                       {...(errors.phone && { error: true, helperText: errors.phone })} />

            <TextField variant="outlined" label="Šifra" type="password" name="password" value={values.password} onChange={handleInputChange}
                       {...(errors.password && { error: true, helperText: errors.password })} />

            <TextField variant="outlined" label="Ponovite šifru" type="password" name="passwordRepeat" value={values.passwordRepeat} onChange={handleInputChange}
                       {...(errors.passwordRepeat && { error: true, helperText: errors.passwordRepeat })} />

            <TextField
                variant="outlined"
                select
                name="roleId"
                label="Uloga"
                value={values.roleId}
                onChange={handleInputChange}
                {...(errors.roleId && { error: true, helperText: errors.roleId })}
            >
                {allRoles.map((role) => (
                    <MenuItem key={role.roleId} value={role.roleId}>
                        {role.name}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                variant="outlined"
                select
                name="groupId"
                value={values.groupId}
                label="Grupa"
                onChange={handleInputChange}
                {...(errors.groupId && { error: true, helperText: errors.groupId })}
            >
                {groupOptions.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                        {group.name}
                    </MenuItem>
                ))}
            </TextField>

            <div className='buttons'>
                <button className="custom-btn outlined" onClick={() => push(RouteLink.AdminPanel)}>Otkaži</button>
                <AsyncButton className="custom-btn" onClick={handleSubmit}>
                    {editMode === true ? "Izmijeni korisnika" : "Kreiraj korisnika"}
                </AsyncButton>
            </div>
        </form>
    );
}

export default connect(state => {

    const groupsTree = state.groups.groups;

    const allGroups = groupsTree.subGroups ? flattenGroup(groupsTree.subGroups) : [];

    const groupOptions = allGroups.filter(g => g.subGroups.length === 0).map(g => ({
        id: g.groupId,
        name: g.name
    }))

    return {
        selectedUser: state.users.selectedUser,
        groupOptions
    }
}, { push, fetchAllGroups, selectUser })(MangeUserForm)

export const flattenGroup = data => {

    return data.reduce((acc, group) => {
        acc.push(group);
        if (group?.subGroups?.length) {
            acc.push(...flattenGroup(group.subGroups))
        }
        return acc;
    }, [])
}