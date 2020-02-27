/**
 * Created by clakeboy on 2019/10/16.
 */
import React from 'react';
import {
    Icon,
    Table,
    Modal,
    Input,
    Card,
    Button,
} from '@clake/react-bootstrap4';
import Fetch from "../../common/Fetch";
import Socket from "../../common/Socket";
import moment from 'moment';

class Bson extends React.Component {
    constructor(props) {
        super(props);
        this.conn = this.props.conn;
        this.state = {
            data:null,
            export_dir:"",
            process:false,
            process_data:{},
            process_time:'',
        };
        this.timeClock = null;
        this.startTime = null;
    }

    componentDidMount() {
        Socket.on(Socket.evtTypes.BACKUP_DATABASE,this.receive);
        this.loadCollection();
    }

    componentWillUnmount() {
        Socket.off(Socket.evtTypes.BACKUP_DATABASE,this.receive);
    }

    componentWillReceiveProps(nextProps) {
        this.conn = nextProps.conn;
        this.loadCollection();
    }

    loadCollection() {
        Fetch('/serv/coll/list',{
            server_id:this.conn.server.id,
            database:this.conn.database,
        },(res)=>{
            if (res.status) {
                this.setState({
                    data:res.data,
                })
            } else {
                this.modal.alert(<>
                    <p>加载 Collection 列表出错:</p>
                    <p>{res.msg}</p>
                </>);
            }
        })
    }

    chooseHandler = (e)=>{
        let dir = window.remote.openDirectory();
        if (dir) {
            this.setState({
                export_dir:dir[0]
            })
        }
    };

    closeHandler = (e)=> {
        if (this.state.process) {
            Socket.emit(Socket.evtTypes.BACKUP_DATABASE,{code: 'cancel'},(data)=>{
                this.cancel()
            })
        } else {
            this.props.callback();
        }
    };

    startHandler = ()=>{
        let list = this.validate();
        if (!list) {
            return
        }
        let data = {
            server:{
                server_id:this.conn.server.id,
                database: this.conn.database,
            },
            type: 1,
            dest_dir:this.state.export_dir,
            collection_list:list,
            code: "start"
        };
        Socket.emit(Socket.evtTypes.BACKUP_DATABASE,data,(data)=>{
            let res = JSON.parse(data);
            if (res.code === 'start') {
                this.start(res);
            } else {
                this.error(res)
            }
        })
    };

    validate() {
        if (this.state.export_dir === "") {
            this.modal.alert("请选择导出数据的存放目录!");
            return false;
        }

        let list = this.coll_table.getSelectRows();
        if (list.length <= 0) {
            this.modal.alert("请选择需要导出的数据集合!");
            return false;
        }

        return list.map(item=>{
            return item.collection;
        });
    }

    receive = (evt,data)=>{
        let res = JSON.parse(data);
        switch (res.code) {
            case 'process':
                this.process(res);
                break;
            case 'complete':
                this.complete(res);
                break;
            case 'error':
                this.error(res);
                break;
            default:
                console.log('none socket event',evt,data);
        }
    };

    start(res) {
        this.startTime = moment().minutes(0).seconds(0).hours(0);
        this.setState({
            process:true,
            process_data:{
                collection:"",
                coll_current:0,
                coll_total:0,
                current:0,
                total:0,
                percentage:0,
            },
            process_time:this.startTime.format("HH:mm:ss")
        },()=>{
            this.timeClock = setInterval(()=>{
                this.startTime.add(1, 's');
                this.setState({
                    process_time:this.startTime.format("HH:mm:ss")
                })
            },1000);
        });
    }

    process(res) {
        this.setState({
            process_data:this.buildProcess(res.data)
        });
    }

    buildProcess(res) {
        let data = this.state.process_data;
        if (res.type === 1) {
            data.collection = res.collection;
            data.coll_current = res.current;
            data.coll_total = res.total;
            data.percentage = 0;
        } else if (res.type === 2) {
            data.current = res.current;
            data.total = res.total;
            data.percentage = Math.round(res.current/res.total*100);
        }
        return data;
    }

    complete(res) {
        clearInterval(this.timeClock);
        this.setState({
            process:false
        },()=>{
            this.modal.alert(<>
                <p>导出数据完成!</p>
                <p>已用时: {this.state.process_time}</p>
            </>,()=>{
                this.props.callback(true);
            });
        });
    }

    cancel() {
        clearInterval(this.timeClock);
        this.setState({
            process:false
        })
    }

    error(res) {
        clearInterval(this.timeClock);
        this.setState({
            process:false
        },()=>{
            this.modal.alert(res.message);
        });
    }

    render() {
        return (
            <div>
                <div className='font-size-75 mb-2'>
                    <span className='mr-2'><Icon icon='server'/> {this.props.conn.server.name}</span>
                    <span className='mr-2'><Icon icon='database'/> {this.props.conn.database}</span>
                </div>
                <hr className='my-2'/>
                <Table ref={c=>this.coll_table=c} className='border' striped={false} sm select={true} height='300px' headerTheme='light' data={this.state.data}>
                    <Table.Header field='collection' text='选择要导出的数据集合' />
                </Table>
                <div className="input-group mt-2">
                    <input type="text" className="form-control" placeholder="请选择保存导出数据目录" value={this.state.export_dir}/>
                    <div className="input-group-append">
                        <Button disabled={this.state.process} onClick={this.chooseHandler}>选择目录</Button>
                    </div>
                </div>
                {this.state.process?this.renderProcess():null}
                <div className='mt-2'>
                    <Button loading={this.state.process} disabled={this.state.process} onClick={this.startHandler}>
                        {this.state.process?'导出数据中...':'开始导出'}
                    </Button>
                    <Button onClick={this.closeHandler} outline theme='secondary' className='float-right'>
                        {this.state.process?'取消导出':'关闭'}
                    </Button>
                </div>
                <Modal ref={c=>this.modal=c}/>
            </div>
        );
    }

    renderProcess() {
        return (
            <Card className='mt-2'>
                正在导出: {this.state.process_data.collection} ({this.state.process_data.coll_current} / {this.state.process_data.coll_total})
                已用时: {this.state.process_time}
                <hr className='my-2'/>
                <div className="progress">
                    <div className="progress-bar progress-bar-striped progress-bar-animated" style={{width:this.state.process_data.percentage+'%'}}>
                        ( {this.state.process_data.current} / {this.state.process_data.total} ) {this.state.process_data.percentage}%
                    </div>
                </div>
            </Card>
        )
    }
}

Bson.propTypes = {

};

Bson.defaultProps = {

};

export default Bson;