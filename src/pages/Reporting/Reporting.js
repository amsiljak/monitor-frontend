import { connect } from "react-redux";
import React, { useState, useEffect } from 'react';
import QueryBuilder from 'react-querybuilder';
import { formatQuery } from 'react-querybuilder';

import request from "../../service";

import { fields, frequencies, devices } from './constants';
import ReportTiming from './ReportTiming';

import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';

import './Reporting.scss';



const Reports = () => {
    const [selectedFrequency, setSelectedFrequency] = useState(frequencies[0].name);
    const [selectedDateTime, setSelectedDateTime] = useState("");
    const [selectedGroup, setSelectedGroup] = useState({ group: null, parent: null });
    const [groups, setGroups] = useState([]);
    const [queryValue, setQueryValue] = useState("");
    const [title, setTitle] = useState("");
    const [selectedColumns, setSelectedColumns] = useState([]);



    const setData = async () => {
        const res = await request("https://si-2021.167.99.244.168.nip.io/api/group/MyAssignedGroups");
        setGroups(res.data.data.subGroups);
        setSelectedGroup({ group: res.data.data.subGroups[0], parent: null });
    };

    useEffect(() => {
        setData();
    }, []);

    const changeTitle = (event) => {
        setTitle(event.target.value);
    };

    const changeFrequency = (event) => {
        setSelectedFrequency(event.target.value);
    };

    const changeDateTime = (event) => {
        setSelectedDateTime(event.target.value);
    };

    const changeGroup = (event) => {
        setSelectedGroup({ group: event.target.value, parent: selectedGroup });
        setGroups(event.target.value.subGroups);
    };

    const changeQuery = query => {
        setQueryValue(query);
    };

    const checkQuery = () => {
        if (queryValue?.rules?.length <= 0 || title.length < 1) return true;
        return false;
    }

    const submitReportForm = e => {
        e.preventDefault();
        console.log("( " + formatQuery(queryValue, 'sql') + " ) and groupId = " + selectedGroup.group.groupId);
    };

    const groupBacktrack = e => {
        if (selectedGroup.parent == null) return;
        var newGroups = selectedGroup.parent.group.subGroups;
        console.log(selectedGroup);
        setSelectedGroup(selectedGroup.parent);
        setGroups(newGroups);
    }

    const changeSelectedColumns = (event) => {
        if (event.target.checked) {
            setSelectedColumns([...selectedColumns, event.target.value]);
        }
        else {
            setSelectedColumns(selectedColumns.filter(col => col !== event.target.value));
        }

    };

    return (
        <div className="reportingWrapper">
            <h1> Reporting </h1>

            <div className="reportingInput">
                <div className="inputWrapper">
                    <InputLabel className="inputLabelWrapper" id="frequencyLabel"> Report title:  </InputLabel>
                    <TextField labelId="frequencyLabel" value={title} className="select" onChange={changeTitle} autoFocus />
                </div>

                

                <div className="inputWrapper">
                    <ReportTiming />
                </div>

                <div className="inputWrapper">
                    <InputLabel className="inputLabelWrapper" id="groupLabel"> Choose a {selectedGroup.parent == null ? "group" : "subgroup"} </InputLabel>
                    <Select className="select" labelId="groupLabel" onChange={changeGroup}>
                        {groups.map(el => <MenuItem key={el.groupId} value={el}> {el.name} </MenuItem>)}
                    </Select>
                </div>

                <div className="inputWrapper">
                    <InputLabel className="inputLabelWrapper">{selectedGroup.parent == null ? "No group is selected" : "You selected the group: " + selectedGroup.group.name}</InputLabel>
                    <div className="select">
                        <Button onClick={groupBacktrack}>Undo</Button> 
                    </div>
                </div>

                <div className="queryBuilderWrapper">
                    <h3 className="queryBuilderTitle"> What do you want in your report? </h3>
                    <QueryBuilder
                        title="reportBuilder"
                        fields={fields}
                        onQueryChange={changeQuery}
                        showNotToggle={true}
                    />
                </div>
                <div>
                    <h3 className="queryBuilderTitle"> Which columns do you want in your report? </h3>

                    {fields.map((inputField, index) => (
                        <div key={index}>
                            <Checkbox
                                value={inputField.name}
                                onChange={changeSelectedColumns}
                            />
                            <InputLabel className="selectCol">
                                {inputField.label}
                            </InputLabel>
                        </div>
                    ))}
                </div>

                <Button onClick={submitReportForm} variant="contained" color="default" disabled={checkQuery()}> Submit </Button>
            </div>
        </div>
    )
};

export default connect(state => ({}), {})(Reports);