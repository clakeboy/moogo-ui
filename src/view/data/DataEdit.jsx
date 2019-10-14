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

import {Button,Modal} from '@clake/react-bootstrap4';
import Fetch from "../../common/Fetch";

class DataEdit extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            editValue:""
        };
    }

    componentDidMount() {
        langTools.addCompleter({
            identifierRegexps: [/[a-zA-Z_0-9\.\$\-\u00A2-\uFFFF]/],
            getCompletions: function(editor, session, pos, prefix, callback) {
                console.log(pos,prefix);
                let coords = editor.renderer.textToScreenCoordinates(pos.row, pos.column);
                console.log(coords);
                callback(null, [
                    {
                        caption: 'users',
                        value: 'users',
                        meta: "Table",
                        icon: 'method'
                    }
                ]);
            }
        });
        this.load(this.props.data.data._id);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        // this.setState({editValue:JSON.stringify(nextProps.data.data,null,4)},()=>{
        //     this.ace.editor.gotoLine(1);
        // });
        this.load(this.props.data.data._id);
    }

    load(id) {
        Fetch("/serv/exec/find",{
            server_id:this.props.conn.server.id,
            database:this.props.conn.database,
            collection:this.props.conn.collection,
            id:id
        },(res)=>{
            if (res.status) {
                this.setState({
                    editValue:JSON.stringify(JSON.parse(res.data),null,2)
                })
            } else {
                this.modal.alert('加载数据出错:'+res.msg);
            }
        })
    }

    getClasses() {
        let base = '';

        return classNames(base,this.props.className);
    }

    save = () => {
        try {
            let data = this.ace.editor.getValue();
            let bson = JSON.parse(data);
            console.log(bson);
        } catch(e) {
            this.modal.alert('不正确的JSON字符串!');
        }
    };

    render() {
        return (
            <div className={this.getClasses()}>
                <div className='mb-1'>
                    <Button icon='save' onClick={this.save}>保存</Button>
                </div>
                <AceEditor ref={c=>this.ace=c} mode="json"
                           theme="solarized_dark"
                           width='100%'
                           name="data_editor"
                           value={this.state.editValue}
                           fontSize='14px'
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