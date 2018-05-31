const { Component } = require('react')
const PropTypes = require('prop-types')
const h = require('react-hyperscript')
const connect = require('react-redux').connect
const actions = require('../../../actions')
const TrezorConnect = require('../../../../lib/trezor-connect.js')

class ConnectAccountForm extends Component {
    constructor(props, context) {
        super(props)               
        this.state = {
            address: null,
            error: null
        }

        console.log("TrezorConnect?", TrezorConnect)
    }

    connectToTrezor(){
        var path = "m/44'/60'/0'/0" 

        TrezorConnect.ethereumGetAddress(path, response => {
            console.log(response);
            if (response.success) {
              this.setState({
                address: `${response.address.slice(
                  0,
                  4
                )}...${response.address.slice(-4)}`,
                error: null
              });
            } else {
              this.setState({ error: response.error, address: null });
              console.error("Error:", response.error); // error message
            }
          }, "1.4.0");
          // 1.4.0 is first firmware that supports ethereum
    }

    render () {
       return h('div.new-account-create-form', [
        
        h('button.btn-primary--lg', {
          onClick: () => {
            this.connectToTrezor()
          },
            style: {
                margin: 12,
            },
        }, 
          'Connect to Trezor',
        ),
           this.state.address ? h('div.new-account-create-form__input-label', {style: {
               margin: 12,
               textAlign: 'center',
           }}, [
            `Succesfully connected to address`,
            h('br'),
            h('b', this.state.address),
           ]) : null,
           this.state.error ? h('span.error', { style: {
               margin: 12,
           }}, this.state.error) : null,
        ])
    }
}

ConnectAccountForm.propTypes = {
    hideModal: PropTypes.func,
    showImportPage: PropTypes.func,
    showConnectPage: PropTypes.func,
    createAccount: PropTypes.func,
    numberOfExistingAccounts: PropTypes.number,
    history: PropTypes.object,
    t: PropTypes.func,
}

const mapStateToProps = state => {
    const { metamask: { network, selectedAddress, identities = {} } } = state
    const numberOfExistingAccounts = Object.keys(identities).length

    return {
        network,
        address: selectedAddress,
        numberOfExistingAccounts,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        toCoinbase: address => dispatch(actions.buyEth({ network: '1', address, amount: 0 })),
        hideModal: () => dispatch(actions.hideModal()),
        createAccount: newAccountName => {
            return dispatch(actions.addNewAccount())
                .then(newAccountAddress => {
                    if (newAccountName) {
                        dispatch(actions.setAccountLabel(newAccountAddress, newAccountName))
                    }
                })
        },
        showImportPage: () => dispatch(actions.showImportPage()),
        showConnectPage: () => dispatch(actions.showConnectPage()),
    }
}

ConnectAccountForm.contextTypes = {
    t: PropTypes.func,
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ConnectAccountForm)

