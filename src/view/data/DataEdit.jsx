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

import {Button,Modal} from '@clake/react-bootstrap4';

class DataEdit extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            editValue:JSON.stringify(this.props.data.data,null,4)
        };
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({editValue:JSON.stringify(nextProps.data.data,null,4)},()=>{
            this.ace.editor.gotoLine(1);
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