/**
 * Created by clakeboy on 2019/10/23.
 */
import React from 'react';
import {
    Button, ButtonGroup,
    Input,
    Modal
} from '@clake/react-bootstrap4';
import Fetch from "../../common/Fetch";

class Create extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            collection:'',
            saving:false
        };
    }

    componentDidMount() {
        console.log(this.props.data);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            collection:'',
        })
    }

    createHandler = ()=>{
        if (this.state.collection === '') {
            this.modal.alert('文档集合名称不为能空!');
            return
        }
        this.saveRemote()
    };

    saveRemote() {
        Fetch("/serv/coll/create",{
            server_id:this.props.conn.server.id,
            database:this.props.conn.database,
            collection:this.state.collection
        },(res)=>{
            if (res.status) {
                this.modal.alert('创建文档集合成功!',()=>{
                    this.props.callback(true);
                });
            } else {
                this.modal.alert(<>
                    <p>创建文档集合出错</p>
                    <p>{res.msg}</p>
                </>);
            }
        })
    }

    save() {
        let data = {
            icon: "database",
            key: "db_test",
            text: this.state.database,
            type: "database",
            children:[],
        };
        this.props.data[0].children.push(data);
        this.props.callback(true);
    }

    render() {
        return (
            <div >
                <Input label={'文档集合名称'} data={this.state.collection} onChange={val=>this.setState({collection:val})}/>
                <div className='clearfix'>
                    <ButtonGroup className='float-right'>
                        <Button icon='save' disabled={this.state.saving} loading={this.state.saving} onClick={this.createHandler}>保存</Button>
                        <Button theme='secondary' outline onClick={()=>{
                            this.props.callback();
                        }}>取消</Button>
                    </ButtonGroup>
                </div>
                <Modal ref={c=>this.modal=c}/>
            </div>
        );
    }
}

export default Create;