import * as React from 'react';
import { connect } from 'react-redux';
import { addToCache } from '../actions';

declare const manywho: any;
declare const navigator: any;

const mapStateToProps = (state) => {
    return state;
};

class CacheManager extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            storageEstimate: null,
        };
    }

    setStorageEstimate = () => {
        let storageEstimate = null;
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            navigator.storage.estimate().then(({ usage, quota }) => {
                storageEstimate = `Using ${String((usage / quota) * 100)}% of potential storage.`;
                this.setState({ storageEstimate });

            }).catch((error) => {
                console.error('Loading storage estimate failed:');
                console.log(error.stack);
            });
        } else {
            console.error('navigator.storage.estimate API unavailable.');
        }
    }

    componentWillReceiveProps = () => {
        this.setStorageEstimate();
    }

    componentDidMount = () => {
        this.setStorageEstimate();
    }

    render() {
        return <div>
        <div>{this.state.storageEstimate}</div>
        </div>;
    }
}

export default connect(
    mapStateToProps,
)(CacheManager);
