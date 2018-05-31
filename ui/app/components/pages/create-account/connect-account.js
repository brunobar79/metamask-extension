const { Component } = require('react')
const PropTypes = require('prop-types')
const h = require('react-hyperscript')
const connect = require('react-redux').connect
const actions = require('../../../actions')
const TrezorConnect = require('../../../../lib/trezor-connect.js')
const HDKey = require('hdkey')
const { publicToAddress, toChecksumAddress } = require('ethereumjs-util')

class ConnectAccountForm extends Component {
    constructor (props, context) {
        super(props)
        this.state = {
            error: null,
            response: null,
            wallets: [],
        }

        console.log('TrezorConnect?', TrezorConnect)
    }

    getDeterministicWallets (data) {
        const {publicKey, chainCode} = data
        const hdk = new HDKey()
        hdk.publicKey = new Buffer(publicKey, 'hex')
        hdk.chainCode = new Buffer(chainCode, 'hex')
        const pathBase = 'm'

        const wallets = []
        for (let i = 0; i < 10; i++) {
            const dkey = hdk.derive(`${pathBase}/${i}`)
            const address = publicToAddress(dkey.publicKey, true).toString('hex')
            wallets.push({
                i,
                address: toChecksumAddress(address),
                balance: 0,
                short_address: `${address.slice(
                    0,
                    10
                )}...${address.slice(-10)}`,
            })
        }
        return wallets
    }

    connectToTrezor () {
        var path = "m/44'/60'/0'/0"

        TrezorConnect.getXPubKey(path, response => {
            console.log(response)
            if (response.success) {

            const wallets = this.getDeterministicWallets(response)


                this.setState({
                    response,
                    error: null,
                    address: `${response.publicKey.slice(
                        0,
                        12
                    )}...${response.publicKey.slice(-12)}`,
                    wallets,

                })


            } else {
              this.setState({ error: response.error, address: null })
              console.error('Error:', response.error) // error message
            }
          }, '1.4.0')
          // 1.4.0 is first firmware that supports ethereum
    }

    renderWallets () {
        if(!this.state.wallets.length) return null;
        return [
             h(
            "div.new-account-create-form__input-label",
            {
                style: {
                    margin: 12,
                    textAlign: "center",
                    fontWeight: 'bold'
                },
                key: 'title',
            },
                ['Your trezor device contains the following ETH addresses:']
            ),
            ...this.state.wallets.map((w, i) => {
            return h(
              "div.new-account-create-form__input-label",
              {
                style: {
                  margin: 12,
                  textAlign: "center"
                },
                  key: `wallet-${i}`,
              },
              [`${w.short_address} - ${w.balance} ETH`, h("br")]
            )
        })]
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
        this.renderWallets(),
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

