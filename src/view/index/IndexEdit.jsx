/**
 * Created by clakeboy on 2019-05-24.
 */
import React from 'react';
import {
    Input, Modal, Tabs, TabsContent,
    CCheckbox, Icon, Button, Common, ButtonGroup
} from '@clake/react-bootstrap4';
import Fetch from "../../common/Fetch";

class IndexEdit extends React.PureComponent {
    constructor(props) {
        super(props);
        this.server = this.props.data.server;
        this.database = this.props.data.database;
        this.collection = this.props.data.collection;

        this.state = {
            is_save:false,
            keys: [],
            background:false,
            unique:false,
            index_name:this.props.data.index,
            server:this.props.data.server,
            database:this.props.data.database,
            collection:this.props.data.collection,
            currentTab: 'keys',
            isAdd: this.props.isAdd,
        };

        this.sortData = [
            {sort:'asc',val:1},
            {sort:'desc',val:-1}
        ];
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.isAdd) {
            this.newIndex(nextProps);
        } else {
            this.loadIndex(nextProps);
        }
    }

    componentDidMount() {
        if (this.props.isAdd) {
            this.newIndex(this.props);
        } else {
            this.loadIndex(this.props);
        }
    }

    newIndex(props) {
        this.setState( {
            keys: [],
            background:false,
            unique:false,
            server:props.data.server,
            database:props.data.database,
            collection:props.data.collection,
            currentTab: 'keys',
        });
    }

    loadIndex(props) {
        this.modal.loading('加载中...');
        Fetch('/serv/index/find',{
            server_id:props.data.server.id,
            database:props.data.database,
            collection:props.data.collection,
            index_name:props.data.index,
        },(res)=>{
            this.modal.close();
            if (res.status) {
                let key_list = Common.map(res.data.key,(val,key)=>{
                    return {
                        key:key,
                        val_text:val===1?'asc':'desc',
                        val:val
                    };
                });

                this.setState({
                    background:res.data.background,
                    index_name:res.data.name,
                    unique:res.data.unique,
                    server:props.data.server,
                    database:props.data.database,
                    collection:props.data.collection,
                    currentTab: 'keys',
                    keys:key_list,
                })
            } else {
                this.modal.alert(`数据读取错误!:${res.msg}`)
            }
        },(e)=>{
            this.modal.alert(<>
                <p>访问网络出错!</p>
                <p>{e}</p>
            </>)
        });
    }

    changeHandler(field) {
        return (checked)=>{
            let data = {};
            data[field] = checked;
            this.setState(data);
        }
    };

    keyChangeHandler(idx,type) {
        return (val,row)=>{
            let list = this.state.keys.slice(0);
            let keyField = list[idx];
            if (type === 'key') {
                keyField.key = val;
            } else if (type === 'sort') {
                keyField.val_text = row.sort;
                keyField.val = row.val;
            } else {
                return
            }
            this.setState({
                keys:list
            });
        }
    }

    addKey = (e)=> {
        let list = this.state.keys.slice(0);
        list.push({'key':'',val_text:'asc',val:1});
        this.setState({
            keys:list
        });
    };

    deleteKey(idx) {
        return ()=>{
            let list = this.state.keys.slice(0);
            list.splice(idx,1);
            this.setState({
                keys:list
            });
        }
    }

    save = ()=>{
        this.setSave();
        this.modal.loading('保存中...');

        let keys = {};
        this.state.keys.forEach((item,idx)=>{
            keys[item.key] = item.val;
        });

        Fetch('/serv/index/add',{
            server_id:this.props.data.server.id,
            database:this.props.data.database,
            collection:this.props.data.collection,
            keys:keys,
            opts:{
                name:this.state.index_name,
                background:this.state.background,
                unique:this.state.unicode,
            }
        },(res)=>{
            this.modal.close();
            if (res.status) {
                this.modal.alert('保存成功!',()=>{
                    this.props.callback();
                });
            } else {
                this.setSave();
                this.modal.alert(`保存数据出错!:${res.msg}`);
            }
        });
    };

    setSave() {
        this.setState({is_save:!this.state.is_save})
    }

    render() {
        return (
            <div>
                <div className='font-size-75 mb-2'>
                    <span className='mr-2'><Icon icon='server'/> {this.state.server.name}</span>
                    <span className='mr-2'><Icon icon='database'/> {this.state.database}</span>
                    <span className='mr-2'><Icon icon='table'/> {this.state.collection}</span>
                </div>
                <Input label='索引名称' data={this.state.index_name} onChange={this.changeHandler('index_name')}/>
                <Tabs showTab={this.state.currentTab} onSelect={(tab)=>{
                    if (typeof tab === 'string') {
                        this.setState({
                            currentTab:tab
                        })
                    }
                }}>
                    <TabsContent id='keys' text='索引字段'>
                        {this.renderFields()}
                    </TabsContent>
                    <TabsContent id='options' text='索引选项'>
                        {this.renderOptions()}
                    </TabsContent>
                </Tabs>
                <div className='mt-3'>
                    <ButtonGroup className='float-right'>
                        <Button icon='save' disabled={this.state.is_save} onClick={this.save}>保存</Button>
                        <Button theme='secondary' outline onClick={()=>{
                            this.props.callback();
                        }}>取消</Button>
                    </ButtonGroup>
                </div>
                <Modal ref={c=>this.modal=c}/>
            </div>
        );
    }

    renderFields() {
        return (<div className='p-3'>
            {this.state.keys.map((item,idx)=>{
                return (<div className='form-row'>
                    <Input label='字段名' className='mr-1' data={item.key} onChange={this.keyChangeHandler(idx,'key')}/>
                    <Input label='排序值' className='mr-1' readOnly combo={{
                        searchColumn:'sort',
                        width:'100%'
                    }} comboData={this.sortData} data={item.val_text} onChange={this.keyChangeHandler(idx,'sort')}/>
                    <div className='form-group d-flex align-items-end'>
                        <Button icon='trash-alt' theme='danger' onClick={this.deleteKey(idx)}/>
                    </div>
                </div>)
            })}
            <Button icon='plus' onClick={this.addKey}>添加字段</Button>
        </div>)
    }

    renderOptions() {
        return (<div className='p-3'>
            <CCheckbox label={<span>后端更新 (<span className='text-black-50'>background</span>)</span>}
                       onChange={this.changeHandler('background')} checked={this.state.background}/>
            <div>

            </div>
            <CCheckbox label={<span>唯一 (<span className='text-black-50'>unique</span>)</span>}
                       onChange={this.changeHandler('unique')} checked={this.state.unique}/>
            <div>

            </div>
        </div>)
    }
}

IndexEdit.propTypes = {

};

IndexEdit.defaultProps = {

};

export default IndexEdit;