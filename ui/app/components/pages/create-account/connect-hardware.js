const { Component } = require("react");
const PropTypes = require("prop-types");
const h = require("react-hyperscript");
const connect = require("react-redux").connect;
const actions = require("../../../actions");

class ConnectHardwareForm extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      error: null,
      response: null,
      btnText: "Connect to Trezor",
      wallets: []
    };
  }

  connectToTrezor() {
    this.setState({ btnText: "Connecting..." });
    this.props
      .connectHardware("trezor")
      .then(_ => {
        this.setState({ btnText: "Connected!" });
      })
      .catch(e => {
        this.setState({ btnText: "Connect to Trezor" });
      });
  }

  renderWallets() {
    return null;
  }

  render() {
    const { connectHardware } = this.props;
    return h("div.new-account-create-form", [
      h(
        "button.btn-primary--lg",
        {
          onClick: () => this.connectToTrezor(),
          style: {
            margin: 12
          }
        },
        this.state.btnText
      ),
      this.renderWallets(),
      this.state.error
        ? h(
            "span.error",
            {
              style: {
                margin: 12
              }
            },
            this.state.error
          )
        : null
    ]);
  }
}

ConnectHardwareForm.propTypes = {
  hideModal: PropTypes.func,
  showImportPage: PropTypes.func,
  showConnectPage: PropTypes.func,
  connectHardware: PropTypes.func,
  numberOfExistingAccounts: PropTypes.number,
  history: PropTypes.object,
  t: PropTypes.func
};

const mapStateToProps = state => {
  const {
    metamask: { network, selectedAddress, identities = {} }
  } = state;
  const numberOfExistingAccounts = Object.keys(identities).length;

  return {
    network,
    address: selectedAddress,
    numberOfExistingAccounts
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toCoinbase: address =>
      dispatch(actions.buyEth({ network: "1", address, amount: 0 })),
    hideModal: () => dispatch(actions.hideModal()),
    connectHardware: deviceName => {
      return dispatch(actions.connectHardware(deviceName));
    },
    showImportPage: () => dispatch(actions.showImportPage()),
    showConnectPage: () => dispatch(actions.showConnectPage())
  };
};

ConnectHardwareForm.contextTypes = {
  t: PropTypes.func
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(
  ConnectHardwareForm
);
