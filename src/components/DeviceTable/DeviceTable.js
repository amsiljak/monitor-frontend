import CustomTable, { TableSlot } from '../CustomTable/CustomTable';
import React, { useState } from "react";
import { CastConnected } from "@material-ui/icons";
import { Edit } from "@material-ui/icons";
import dayjs from 'dayjs';
import { connect } from "react-redux";
import { selectDevice, updateActiveDevice, updateDevicesTableForGroup } from "../../store/modules/devices/actions";
import { push } from "connected-react-router";
import { RouteLink } from "../../store/modules/menu/menu";

import './device_table.scss'
import request, { wsEndpoint } from "../../service";
import { showSwalToast } from "../../utils/utils";
import FilterList from "@material-ui/icons/FilterList";
import { Checkbox, Chip, FormControl, Input, ListItemText, MenuItem, Select } from "@material-ui/core";
import { DEVICE_STATUS } from "../../store/modules/devices/devices";
import CustomPagination from "../CustomTable/components/CustomPagination";

const DEVICE_WS_STATUS = {
    WAITING: "Waiting",
    IN_USE: "In use",
}

const DEVICE_STATUS_TEXT = {
    [DEVICE_WS_STATUS.WAITING]: "Spreman",
    [DEVICE_WS_STATUS.IN_USE]: "U upotrebi",
    OFFLINE: "Van mreže"
}

const DEVICE_STATUS_COLORS = {
    [DEVICE_WS_STATUS.WAITING]: "#5db98c",
    [DEVICE_WS_STATUS.IN_USE]: "#bdbdbd",
    OFFLINE: "#ff5252",
}

const DeviceTable = ({
                         devices,
                         selectDevice,
                         push,
                         user,
                         activeDevices,
                         deviceTable,
                         group,
                         updateDevicesTableForGroup,
                         updateActiveDevice
                     }) => {

    const [statusFilterOpened, setStatusFilterOpened] = React.useState(false);

    const async = deviceTable?.async;

    const editDevice = (device) => {
        selectDevice(device);
        push(RouteLink.ManageDevice);
    }

    const connectDevice = (device) => {
        const activeDevice = activeDevices.find(d => (d.deviceUid === device.deviceUid));

        if (activeDevice) {
            request(wsEndpoint + "/agent/connect", "POST", {
                deviceUid: activeDevice.deviceUid,
                user: user?.email,
            }).then(r => {
                console.log(r);
                if (r?.data?.type === "Connected") {
                    showSwalToast("Uređaj je uspješno konektovan.", 'success')
                    updateActiveDevice(activeDevice.deviceUid, { status: r.data.type })
                    // push(RouteLink.Dashboard)
                }
            })
        } else {
            showSwalToast("Uređaj nije online.");
        }
    }

    const canConnectToDevice = device => {

        const activeDevice = activeDevices.find(d => (d.deviceUid === device.deviceUid));

        return activeDevice && (activeDevice.status === DEVICE_WS_STATUS.WAITING);
    }

    const [tableFields] = useState([
        {
            name: 'name',
            title: 'Naziv',
            sort: true,
        },
        {
            name: 'location',
            title: 'Lokacija',
            sort: true,
        },
        {
            name: 'status',
            title: 'Status',
            slot: 'status',
            sort: true,
        },
        {
            name: 'LastTimeOnline',
            title: 'Posljednji put online',
            width: '30%',
            sort: true,
            slot: 'lastTimeOnline'
        },
        {
            name: 'actions',
            title: 'Akcije',
            width: '20%',
            align: 'right',
            slot: 'actions'
        }]
    )

    const renderDeviceStatus = device => {

        const activeDevice = activeDevices.find(d => (d.deviceUid === device.deviceUid));

        const status = activeDevice?.status ?? "OFFLINE";

        const text = DEVICE_STATUS_TEXT[status];
        const backgroundColor = DEVICE_STATUS_COLORS[status];

        return <Chip style={{ background: backgroundColor, color: "#fff" }}
                     size={'small'}
                     label={text}/>
    }

    const handleFiltersChange = (name, value) => {

        updateDevicesTableForGroup({
            groupId: group.groupId,
            data: {
                [name]: value
            }
        })
    }

    const handleChangePage = (page) => {
        updateDevicesTableForGroup({ groupId: group.groupId, data: { page } })
    }

    const handleChangePerPage = (perPage) => {
        updateDevicesTableForGroup({ groupId: group.groupId, data: { perPage } })
    }

    const handleSort = (field, order) => {
        updateDevicesTableForGroup({ groupId: group.groupId, data: { sortField: field, sortOrder: order } })
    }

    return (
        <div className='device-table'>
            <FilterList className='filter-btn' onClick={() => setStatusFilterOpened(true)}/>
            {statusFilterOpened ?
                <FormControl style={{ float: 'right' }}>
                    <Select
                        labelId="demo-controlled-open-select-label"
                        id="demo-controlled-open-select"
                        open={statusFilterOpened}
                        onClose={() => setStatusFilterOpened(false)}
                        onOpen={() => setStatusFilterOpened(true)}
                        value={deviceTable.status}
                        input={<Input/>}>
                        <MenuItem value="" disabled>
                            <em>Status</em>
                        </MenuItem>
                        <MenuItem>
                            <Checkbox checked={deviceTable.status === DEVICE_STATUS.ACTIVE}
                                      color={'primary'}
                                      onChange={(e, val) =>
                                          handleFiltersChange('status', val === true ? DEVICE_STATUS.ACTIVE : DEVICE_STATUS.INACTIVE)
                                      }/>
                            <ListItemText primary="Active"/>
                        </MenuItem>
                    </Select>
                </FormControl>
                : null}
            <React.Fragment>
                <CustomTable data={devices}
                             async={async}
                             fields={tableFields}
                             activeSortField={deviceTable.sortField}
                             activeSortOrder={deviceTable.sortOrder}
                             handleSort={handleSort}>
                    <TableSlot slot='actions' render={dataRow => (
                        <div className='actions'>
                            {canConnectToDevice(dataRow) && (
                                <CastConnected className='connect-btn'
                                               onClick={() => connectDevice(dataRow)}/>
                            )}
                            <Edit className='edit-btn' onClick={() => editDevice(dataRow)}/>
                        </div>
                    )}/>

                    <TableSlot slot='lastTimeOnline' render={dataRow => (
                        <span>
                                {dayjs(dataRow.lastTimeOnline).format('DD.MM.YYYY HH:mm:ss')}
                            </span>
                    )}/>

                    <TableSlot slot='status' render={dataRow => (
                        <span>
                            {renderDeviceStatus(dataRow)}
                        </span>
                    )}/>
                </CustomTable>

                <CustomPagination totalCount={deviceTable.totalCount}
                                  page={deviceTable.page}
                                  perPage={deviceTable.perPage}
                                  handleChangePage={handleChangePage}
                                  handleChangePerPage={handleChangePerPage}
                />
            </React.Fragment>
        </div>
    )
}

export default connect((state, ownProps) => {

        const { group } = ownProps;
        const groupId = group?.groupId || null;

        const deviceTable = state.devices.deviceTables?.[groupId] || {};

        return {
            activeDevices: state.devices.activeDevices,
            user: state.login.user,
            deviceTable
        }
    }
    ,
    {
        selectDevice,
        push,
        updateDevicesTableForGroup,
        updateActiveDevice
    }
)(DeviceTable);
