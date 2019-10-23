/**
 * Created by clakeboy on 2019-09-30.
 */
import React from 'react';
import {
    Card,
    Input,
    Icon,
    Title,
    Button, Modal
} from '@clake/react-bootstrap4';
import Fetch from "../../common/Fetch";
import Socket from '../../common/Socket';

class Collection extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            destSrc:{
                server_name:'',
                server_id:'',
                database:'',
                collection:'',
            },
            src: {
                server_name:this.props.src.server.name,
                server_id:this.props.src.server.id,
                database:this.props.src.database,
                collection:this.props.src.collection,
            },
            process: false,
            processData: {
                current:0,
                total:0,
                percentage: 0,
            }
        };
    }

    componentDidMount() {
        Socket.on(Socket.evtTypes.CLONE_COLLECTION,this.receive)
    }

    componentWillUnmount() {
        Socket.off(Socket.evtTypes.CLONE_COLLECTION,this.receive)
    }

    closeHandler = ()=>{
        if (this.state.process) {
            Socket.emit(Socket.evtTypes.CLONE_COLLECTION,{code: 'cancel'})
        } else {
            this.props.callback();
        }
    };

    startHandler = ()=>{
        if (!this.validate()) {
            return
        }

        let data = {
            src:{
                server_id:this.state.src.server_id,
                database: this.state.src.database,
                collection: this.state.src.collection,
            },
            dest:{
                server_id:this.state.destSrc.server_id,
                database: this.state.destSrc.database,
                collection: this.state.destSrc.collection,
            },
            code: "start"
        };
        Socket.emit(Socket.evtTypes.CLONE_COLLECTION,data,(data)=>{
            let res = JSON.parse(data);
            if (res.code === 'start') {
                this.start(res);
            } else {
                this.error(res)
            }
        })
    };

    validate() {
        if (this.state.destSrc.server_name === "") {
            this.modal.alert("请选择克隆目标服务器!");
            return false;
        }
        if (this.state.destSrc.database === '') {
            this.modal.alert("请选择克隆目标数据库!");
            return false;
        }
        if (this.state.destSrc.collection === '') {
            this.modal.alert("请填写克隆目标数据集合名称!");
            return false;
        }

        if (this.state.destSrc.database === this.state.src.database
            && this.state.destSrc.collection === this.state.src.collection) {
            this.modal.alert("同数据库内不能有相同的数据集合名!");
            return false;
        }
        return true;
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
        this.setState({
            process:true,
            processData:{
                current:res.data.current,
                total:res.data.total,
                percentage: Math.round(res.data.current/res.data.total*100),
            }
        });
    }

    process(res) {
        this.setState({
            processData:{
                current:res.data.current,
                total:res.data.total,
                percentage: Math.round(res.data.current/res.data.total*100),
            }
        });
    }

    complete(res) {
        this.setState({
            process:false
        },()=>{
            this.modal.alert('克隆数据完成!',()=>{
                this.props.callback(true);
            });
        });
    }

    cancel() {
        Socket.emit(Socket.evtTypes.CLONE_COLLECTION,data,(data)=>{
            let res = JSON.parse(data);
            if (res.code === 'start') {
                this.start(res);
            } else {
                this.error(res)
            }
        })
    }

    error(res) {
        this.setState({
            process:false
        },()=>{
            this.modal.alert(res.message);
        });
    }

    render() {
        return (
            <div>
                <Card header='数据源' className='mb-2'>
                    <div className='row'>
                        <div className='col'>
                            <Input textClass='text-primary' label={<>服务器连接<Icon className='ml-1' icon='server'/></>} plaintext
                                   data={this.props.src.server.name}/>
                        </div>
                        <div className='col'>
                            <Input textClass='text-primary' label={<>数据库<Icon className='ml-1' icon='database'/></>} plaintext
                                   data={this.props.src.database}/>
                        </div>
                        <div className='col'>
                            <Input textClass='text-primary' label={<>数据集合<Icon className='ml-1' icon='table'/></>} plaintext
                                   data={this.props.src.collection}/>
                        </div>
                    </div>
                </Card>
                <Card header='目的源' className='mb-2'>
                    <div className='row'>
                        <div className='col'>
                            <Input textClass='text-primary' readOnly disabled={this.state.process} label={<>已连接服务器列表<Icon className='ml-1' icon='server'/></>}
                                   data={this.state.destSrc.server_name}
                                   combo={{
                                       width:'100%',
                                       searchColumn:'name',
                                       filterColumns:['name'],
                                       onSearch: (search,callback)=>{
                                           Fetch('/serv/server/get_active',{name:search},(res)=>{
                                               if (res.status) {
                                                   callback(res.data);
                                               } else {
                                                   callback(null);
                                               }
                                           },(e)=>{
                                               console.log(e);
                                               callback(null);
                                           });
                                       }
                                   }}
                                   onChange={(val,row)=>{
                                       let data = this.state.destSrc;
                                       data.server_id = row.id;
                                       data.server_name = row.name;
                                       this.setState({
                                           destSrc:data,
                                       })
                                   }}
                            />
                        </div>
                        <div className='col'>
                            <Input textClass='text-primary' disabled={this.state.process} summary='创建新数据库请直接输入数据库名'
                                   label={<>数据库<Icon className='ml-1' icon='database'/></>}
                                   data={this.state.destSrc.database}
                                   combo={{
                                       width:'100%',
                                       searchColumn:'name',
                                       filterColumns:['name'],
                                       onSearch: (search,callback)=>{
                                           Fetch('/serv/database/query',{server_id:this.state.destSrc.server_id},(res)=>{
                                               if (res.status) {
                                                   callback(res.data);
                                               } else {
                                                   callback(null);
                                               }
                                           },(e)=>{
                                               console.log(e);
                                               callback(null);
                                           });
                                       }
                                   }}
                                   onChange={(val,row)=>{
                                       let data = this.state.destSrc;
                                       data.database = val;
                                       this.setState({
                                           destSrc:data,
                                       })
                                   }}
                            />
                        </div>
                        <div className='col'>
                            <Input textClass='text-primary' disabled={this.state.process} label={<>数据集合<Icon className='ml-1' icon='table'/></>}
                                   data={this.state.destSrc.collection}
                                   onChange={(val)=>{
                                       let data = this.state.destSrc;
                                       data.collection = val;
                                       this.setState({
                                           destSrc:data,
                                       })
                                   }}
                            />
                        </div>
                    </div>
                </Card>
                {this.state.process?this.renderProcess():null}
                <Button onClick={this.startHandler} loading={this.state.process} disabled={this.state.process} >
                    {this.state.process?'克隆数据中...':'开始克隆'}
                </Button>
                <Button onClick={this.closeHandler} outline theme='secondary' className='float-right'>
                    {this.state.process?'取消克隆':'关闭'}
                </Button>
                <Modal ref={c=>this.modal=c}/>
            </div>
        );
    }

    renderProcess() {
        return (
            <Card className='mb-2'>
                <div className="progress">
                    <div className="progress-bar progress-bar-striped progress-bar-animated" style={{width:this.state.processData.percentage+'%'}}>
                        ( {this.state.processData.current} / {this.state.processData.total} ) {this.state.processData.percentage}%
                    </div>
                </div>
            </Card>
        )
    }
}

Collection.propTypes = {

};

Collection.defaultProps = {

};

export default Collection;