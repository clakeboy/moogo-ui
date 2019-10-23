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
            database:'',
            saving:false
        };
    }

    componentDidMount() {
        console.log(this.props.data);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            database:'',
        })
    }

    createHandler = ()=>{
        if (this.state.database === '') {
            this.modal.alert('数据库名称不为能空!');
            return
        }
        this.save()
    };

    save() {
        let data = {
            icon: "database",
            key: "db_test",
            text: this.state.database,
            type: "database",
            children:[],
            data: {
                database:this.state.database,
                server: this.props.data[0].data
            }
        };
        this.props.data[0].children.push(data);
        this.props.callback(true);
    }

    render() {
        return (
            <div >
                <Input label={'数据库名称'} data={this.state.database} onChange={val=>this.setState({database:val})}/>
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