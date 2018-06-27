/**
 * 动态加载组件
 */
import React from 'react';

export default class LoaderComponent extends React.Component {
    constructor(prop) {
        super(prop);
        this.state = {
            instance:null,
            noFound:false
        };
    }

    componentDidMount() {
        this.loadComponent(this.props.loadPath);
    }

    componentWillReceiveProps(nextProp) {
        if (this.props.loadPath !== nextProp.loadPath) {
            this.loadComponent(nextProp.loadPath);
        }
    }

    loadComponent(loadPath) {
        GetComponent(loadPath).then(component=>{
            if (typeof component === "string") {
                this.setState({
                    noFound:true
                });
            } else {
                this.setState({
                    instance:component
                });
            }
        });
    }

    render() {
        if (this.state.instance) {
            return this.renderCompoent()
        } else {
            return (
                <div>
                    {this.state.noFound?'没有找到模块':'加载中...'}
                </div>
            );
        }
    }

    renderCompoent() {
        let Instance = this.state.instance;
        return <Instance {...this.props}/>;
    }
}


function GetComponent(path) {
    console.log(path);
    return import('../view'+path).then(component=>{
        return component.default;
    }).catch(error=>{
        console.log(path);
        return 'An error occurred while loading the component '+error
    });
}