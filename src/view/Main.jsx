/**
 * Created by clakeboy on 2017/12/3.
 */

import React from 'react';
import {
    Tabs,
    TabsContent
} from '@clake/react-bootstrap4';
// import {Tabs,TabsContent} from "../../../react-bootstrap-v4/src/index";
import MoEvent from "../common/Event";
import {GET_DATA} from "../common/Events";
import DataPanel from "./data/DataPanel";

class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            panelList:[]
        };

    }

    componentDidMount() {
        MoEvent.on(GET_DATA,(type,args,cb)=>{
            let list = this.state.panelList.slice();
            list.push(args);
            this.setState({
                panelList:list,
                currentShow:`${args.server.id}-${args.database}-${args.collection}-${args.tab_id}`
            })
        });
    }

    render() {
        return (
            <div className='h-100 w-100 p-1'>
                <Tabs sm width='100%' height='100%' showTab={this.state.currentShow} onClose={(id,idx)=>{
                    let list = this.state.panelList.slice();
                    list.splice(idx,1);
                    let state = {
                        panelList:list,
                    };
                    if (id === this.state.currentShow) {
                        state.currentShow = null;
                    }
                    this.setState(state);
                }}>
                    {this.state.panelList.map((panel,index)=>{
                        return <TabsContent id={`${panel.server.id}-${panel.database}-${panel.collection}-${panel.tab_id}`} text={panel.collection}>
                            <DataPanel server={panel.server} database={panel.database} collection={panel.collection}/>
                        </TabsContent>
                    })}
                </Tabs>
            </div>
        );
    }
}

export default Main;