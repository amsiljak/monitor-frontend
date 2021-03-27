import CustomTable, { TableSlot } from '../CustomTable/CustomTable';
import { useState } from "react";
import { CastConnected, Delete } from "@material-ui/icons";
import dayjs from 'dayjs';

const DeviceTable = ({ devices }) => {
    const [tableData, setTableData] = useState(devices);

    const deleteTableRow = (tableRow) => {
        console.log(tableRow);
    }

    const connectDevice = (tableRow) => {
        console.log(tableRow)
    }

    const [tableFields, setTableFields] = useState([
        {
            name: 'name',
            title: 'Naziv',
        },
        {
            name: 'location',
            title: 'Lokacija',
        },
        {
            name: 'status',
            title: 'Status',
            slot: 'status'
        },
        {
            name: 'lastTimeOnline',
            title: 'Posljednji put online',
            width: '30%',
            slot: 'lastTimeOnline'
        },
        {
            name: 'connection',
            title: 'Konekcija',
            align: 'center',
            slot: 'connection'
        },
        {
            name: 'actions',
            title: 'Akcije',
            width: '20%',
            align: 'right',
            slot: 'actions'
        }
    ])

    return (
        <CustomTable data={tableData} fields={tableFields}>

            <TableSlot slot='actions' render={dataRow => (
                <Delete onClick={() => deleteTableRow(dataRow)}/>
            )}/>

            <TableSlot slot='lastTimeOnline' render={dataRow => (
                <span>
                    {dayjs(dataRow.lastTimeOnline).format('DD.MM.YYYY HH:mm:ss')}
                </span>
            )}/>

            <TableSlot slot='status' render={dataRow => (
                <span>{dataRow.status === true ? 'Online' : 'Offline'}</span>
            )}/>
            
            <TableSlot slot='connection' render={dataRow => (
                <CastConnected onClick={() => connectDevice(dataRow)}/>
            )}/>  
        </CustomTable>
    )
}

export default DeviceTable;