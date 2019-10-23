/**
 * Created by clakeboy on 2019-04-28.
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/monokai';
import 'brace/theme/solarized_dark';
import 'brace/ext/searchbox';
import 'brace/ext/language_tools'
let langTools = ace.acequire('ace/ext/language_tools');

import {Button, Icon, Modal} from '@clake/react-bootstrap4';
import Fetch from "../../common/Fetch";

class DataEdit extends React.PureComponent {
    constructor(props) {
        super(props);

        this.mode = this.props.mode; //add,modify
        this.conn = this.props.conn;
        this.state = {
            editValue:"",
            saving: false
        };
    }

    componentDidMount() {
        langTools.addCompleter({
            identifierRegexps: [/[a-zA-Z_0-9\.\$\-\u00A2-\uFFFF]/],
            getCompletions: function(editor, session, pos, prefix, callback) {
                let coords = editor.renderer.textToScreenCoordinates(pos.row, pos.column);
                console.log(coords);
                callback(null, [
                    {
                        caption: 'users',
                        value: 'users',
                        meta: "Table"
                    }
                ]);
            }
        });
        if (this.mode === 'modify')
            this.load(this.props.data.data._id);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        // this.setState({editValue:JSON.stringify(nextProps.data.data,null,4)},()=>{
        //     this.ace.editor.gotoLine(1);
        // });
        this.mode = nextProps.mode;
        this.conn = nextProps.conn;
        if (this.mode === 'modify')
            this.load(nextProps.data.data._id);
    }

    saveHandler = () => {
        let data = this.ace.editor.getValue();
        this.setState({saving:true,editValue:data});
        if (this.mode === "add") {
            this.insert(data);
        } else {
            this.save(data);
        }
    };

    load(id) {
        this.modal.loading('加载数据中...');
        Fetch("/serv/exec/find",{
            server_id:this.conn.server.id,
            database:this.conn.database,
            collection:this.conn.collection,
            id:id
        },(res)=>{
            this.modal.close();
            if (res.status) {
                this.setState({
                    editValue:JSON.stringify(JSON.parse(res.data),null,2)
                },()=>{
                    this.ace.editor.gotoLine(1);
                })
            } else {
                this.modal.alert('加载数据出错:'+res.msg);
            }
        })
    }

    save(data) {
        this.modal.loading('保存数据中...');
        Fetch("/serv/exec/update",{
            server_id:this.conn.server.id,
            database:this.conn.database,
            collection:this.conn.collection,
            data:data,
            id:this.props.data.data._id
        },(res)=>{
            this.modal.close();
            if (res.status) {
                this.modal.alert('保存成功!',()=>{
                    this.setState({saving:false})
                });
            } else {
                this.modal.alert(<>
                    保存数据出错:<br/>
                    {res.msg}
                </>,()=>{
                    this.setState({saving:false})
                });
            }
        })
    }

    insert(data) {
        this.modal.loading('保存数据中...');
        Fetch("/serv/exec/insert",{
            server_id:this.conn.server.id,
            database:this.conn.database,
            collection:this.conn.collection,
            data:data
        },(res)=>{
            this.modal.close();
            if (res.status) {
                this.modal.alert('保存成功!',()=>{
                    this.setState({saving:false})
                });
            } else {
                this.modal.alert(<>
                    保存数据出错:<br/>
                    {res.msg}
                </>);
            }
        })
    }

    render() {
        return (
            <div>
                <div className='font-size-75 mb-2'>
                    <span className='mr-2'><Icon icon='server'/> {this.conn.server.name}</span>
                    <span className='mr-2'><Icon icon='database'/> {this.conn.database}</span>
                    <span className='mr-2'><Icon icon='table'/> {this.conn.collection}</span>
                    {this.props.mode === 'modify'?<span className='mr-2 text-danger'>-> <Icon icon='sticky-note'/> {this.props.data.data._id}</span>:null}
                </div>
                <hr/>
                <div className='mb-1 clearfix'>

                    <Button icon='save' className='float-right' disabled={this.state.saving} loading={this.state.saving} onClick={this.saveHandler}>
                        {this.state.process?'保存数据中...':'保存数据'}
                    </Button>
                </div>
                <AceEditor ref={c=>this.ace=c} mode="json"
                           theme="solarized_dark"
                           width='100%'
                           name="data_editor"
                           value={this.state.editValue}
                           fontSize='14px'
                           tabSize={2}
                           className='rounded'
                           showPrintMargin={false}
                           editorProps={{$blockScrolling: Infinity}}
                           enableBasicAutocompletion={true}
                           enableLiveAutocompletion={true}
                />
                <Modal ref={c=>this.modal=c}/>
            </div>
        );
    }
}

DataEdit.propTypes = {

};

DataEdit.defaultProps = {

};

export default DataEdit;