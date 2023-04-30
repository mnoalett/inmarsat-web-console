import React, {
    useEffect,
    useState,
} from "react";
import Moment from "react-moment";
import { safetyNet } from "./settings";
import { useHistoryStore } from "./stores";

export default () => {
    const [message, setMessage] = useState<string>(safetyNet ? "Welcome to EGC SafetyNET LIVE Terminal!" : "Welcome to Inmarsat C LIVE Terminal!");
    const [selectedRow, setSelectedRow] = React.useState(-1);
    const loadHistory = useHistoryStore(state => state.load);
    const messages = useHistoryStore(state => state.messages);
    const socket = useHistoryStore((state) => state.socket);
    const addToHistory = useHistoryStore(state => state.add);

    useEffect(() => {
        loadHistory();
        socket.on('newMessage', (message: Message) => { addToHistory(message); })
    }, []);

    const selectRow = (item: Message, index: number) => {
        setMessage(item.message);
        setSelectedRow(index);
    }

    return (
        <>
            <div className="output">
                <table>
                    <thead>
                        { safetyNet ? 
                            <tr className="header">
                                <th>Received</th>
                                <th>Seq Nr</th>
                                <th>Priority</th>
                                <th>Rep</th>
                                <th>Service</th>
                            </tr>
                            :
                            <tr className="header">
                                <th>Received</th>
                                <th>Sat</th>
                                <th>Les</th>
                                <th>Msg length</th>
                            </tr>
                        }
                        
                    </thead>
                    <tbody>
                        {messages.map((message, index) => { return (
                            safetyNet ?
                                <tr key={(message as SafetyNetMessage).message_sequence_number} className={selectedRow === index ? 'selected' : ''} onClick={() => {selectRow(message, index)}}>
                                    <td><Moment interval={1000} fromNow>{(message as SafetyNetMessage).timestamp*1000}</Moment></td>
                                    <td>{(message as SafetyNetMessage).message_sequence_number}</td>
                                    <td className={(message as SafetyNetMessage).priority === "Distress" ? 'prio-distress' : ''}>{(message as SafetyNetMessage).priority}</td>
                                    <td>{(message as SafetyNetMessage).repetition_number}</td>
                                    <td>{(message as SafetyNetMessage).service_code_and_address_name.replace("SafetyNET", "[SN]")}</td>
                                </tr>
                            : 
                                <tr key={(message as StdCMessage).timestamp} className={selectedRow === index ? 'selected' : ''} onClick={() => {selectRow(message, index)}}>
                                    <td><Moment interval={1000} fromNow>{(message as StdCMessage).timestamp*1000}</Moment></td>
                                    <td>{(message as StdCMessage).sat_name}</td>
                                    <td>{(message as StdCMessage).les_name}</td>
                                    <td>{(message as StdCMessage).length}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="output" style={{marginTop: '20px'}}>
                {message.split('\n').map((str, index) => <p key={index} style={{ fontFamily: 'VT323', fontSize: '20px', margin: '5px'}}>{str}</p>)}
            </div>
        </>
    );
};