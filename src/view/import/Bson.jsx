/**
 * Created by clakeboy on 2019/10/21.
 */
import React from 'react';
import {
    Button,
    Card, Icon, Input, Modal, Table,
    Tabs,
    TabsContent
} from "@clake/react-bootstrap4";
import Fetch from "../../common/Fetch";
import Socket from "../../common/Socket";
import moment from 'moment';

class Bson extends React.Component {
    constructor(props) {
        super(props);
        this.conn = this.props.conn;
        this.state = {
            select_type:'file',
            import_file: '',
            import_dir:'',
            process_data:{},
            file_data:[],
            dir_data:[],
            process_time:'',
        };
        this.timeClock = null;
        this.startTime = null;
    }

    componentDidMount() {
        Socket.on(Socket.evtTypes.IMPORT_DATA,this.receive);
    }

    componentWillUnmount() {
        Socket.off(Socket.evtTypes.IMPORT_DATA,this.receive);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.conn = nextProps.conn;
        this.setState({
            select_type:'file',
        })
    }

    tabSelectHandler = (id)=>{
        this.setState({
            select_type:id,
            data:id==='file'?this.state.file_data:this.state.dir_data
        })
    };

    chooseHandler(type) {
        if (type === 'file') {
            window.remote.openFile((file)=>{
                if (file) {
                    this.setState({
                        import_file:file[0]
                    },()=>{
                        this.getImportList()
                    })
                }
            })
        } else {
            window.remote.openDirectory((dir)=>{
                if (dir) {
                    this.setState({
                        import_dir:dir[0]
                    },()=>{
                        this.getImportList()
                    })
                }
            })
        }
    }

    closeHandler = (e)=> {
        if (this.state.process) {
            Socket.emit(Socket.evtTypes.IMPORT_DATA,{code: 'cancel'},(data)=>{
                this.cancel()
            })
        } else {
            this.props.callback();
        }
    };

    getImportList() {
        this.modal.loading("加载导入列表");
        Fetch("/serv/backup/read",{
            read_type:this.state.select_type,
            target_path:this.state.select_type === 'file'?this.state.import_file : this.state.import_dir
        },(res)=>{
            this.modal.close();
            if (res.status) {
                let state;
                if (this.state.select_type === 'file') {
                    state = {
                        data:res.data,
                        file_data:res.data,
                    };
                } else {
                    state = {
                        data:res.data,
                        dir_data:res.data,
                    };
                }
                this.setState(state,()=>{
                    this.coll_table.selectAll(true);
                })
            } else {
                this.modal.alert(<>
                    <p>加载导入列表出错:</p>
                    <p>{res.msg}</p>
                </>);
            }
        })
    }

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
            type: this.state.select_type === 'file'?1:2,
            path: this.state.select_type === 'file'?this.state.import_file:this.state.import_dir,
            collection_list:list,
            code: "start"
        };
        Socket.emit(Socket.evtTypes.IMPORT_DATA,data,(data)=>{
            let res = JSON.parse(data);
            if (res.code === 'start') {
                this.start(res);
            } else {
                this.error(res)
            }
        })
    };

    validate() {
        if (this.state.select_type === 'file' && this.state.import_file === "") {
            this.modal.alert("请选择一个需要导入的压缩数据文件!");
            return false;
        }

        if (this.state.select_type === 'folder' && this.state.import_dir === "") {
            this.modal.alert("请选择需要导入的数据目录!");
            return false;
        }

        let list = this.coll_table.getSelectRows();
        if (list.length <= 0) {
            this.modal.alert("请在列表中选择需要导入的数据文件!");
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
            }
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
        } else if (res.type === 2) {
            data.collection = res.collection;
            data.current = res.current;
            data.total = this.formatSize(res.total);
        }
        return data;
    }

    complete(res) {
        clearInterval(this.timeClock);
        this.setState({
            process:false
        },()=>{
            this.modal.alert(<>
                <p>导入数据完成!</p>
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

    formatSize(val) {
        let data = '';
        if (val>1e6)
            data = Math.round(val/1024/1024*100)/100 + ' MiB';
        else
            data =  Math.round(val/1024*100)/100+' KiB';
        return data;
    }

    render() {
        return (
            <div>
                <div className='font-size-75 mb-2'>
                    <span className='mr-2'><Icon icon='server'/> {this.props.conn.server.name}</span>
                    <span className='mr-2'><Icon icon='database'/> {this.props.conn.database}</span>
                </div>
                <hr className='my-2'/>
                <Tabs showTab={this.state.select_type} onSelect={this.tabSelectHandler}>
                    <TabsContent id='file' text='选择文件'>
                        <div className="p-2">
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder="选择导入文件" value={this.state.import_file}/>
                                <div className="input-group-append">
                                    <Button disabled={this.state.process} onClick={()=>{
                                        this.chooseHandler('file')
                                    }}>选择文件</Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent id='folder' text='选择文件夹'>
                        <div className="p-2">
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder="选择导入文件夹" value={this.state.import_dir}/>
                                <div className="input-group-append">
                                    <Button disabled={this.state.process} onClick={()=>{
                                        this.chooseHandler('folder')
                                    }}>选择文件夹</Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
                <Table ref={c=>this.coll_table=c} className='border mt-2' emptyText='没有可导入的数据集合' striped={false} sm select={true} height='300px' headerTheme='light' data={this.state.data}>
                    <Table.Header field='collection' text='选择要导入的数据集合' />
                    <Table.Header field='size' text='文件大小' onFormat={(val)=>{
                        return this.formatSize(val);
                    }}/>
                </Table>
                {this.state.process?this.renderProcess():null}
                <div className='mt-2'>
                    <Button loading={this.state.process} disabled={this.state.process} onClick={this.startHandler}>
                        {this.state.process?'导入数据中...':'开始导入'}
                    </Button>
                    <Button onClick={this.closeHandler} outline theme='secondary' className='float-right'>
                        {this.state.process?'取消导入':'关闭'}
                    </Button>
                </div>
                <Modal ref={c=>this.modal=c}/>
            </div>
        );
    }

    renderProcess() {
        return (
            <Card className='mt-2'>
                正在导入: {this.state.process_data.collection} ( {this.state.process_data.coll_current} / {this.state.process_data.coll_total} )
                已用时: {this.state.process_time}
                <hr className='my-2'/>
                <div className="progress">
                    <div className="progress-bar progress-bar-striped progress-bar-animated w-100">
                        ( {this.state.process_data.current} - {this.state.process_data.total} )
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