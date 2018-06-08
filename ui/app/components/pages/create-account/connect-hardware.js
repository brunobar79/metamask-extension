const { Component } = require("react");
const PropTypes = require("prop-types");
const h = require("react-hyperscript");
const connect = require("react-redux").connect;
const actions = require("../../../actions");
const genAccountLink = require("../../../../lib/account-link.js");
const log = require("loglevel");
const { DEFAULT_ROUTE } = require("../../../routes");

class ConnectHardwareForm extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      error: null,
      response: null,
      btnText: "Connect to Trezor", //Test
      selectedAccount: "",
      accounts: [
        {
          index: 0,
          address: "0x2419EB3D5E048f50D386f6217Cd5033eBfc36b83",
          balance: 0
        },
        {
          index: 1,
          address: "0x37bD75826582532373D738F83b913C97447b0906",
          balance: 0
        },
        {
          index: 2,
          address: "0xcB6e794c299e69Ab3feE57d3b112AaD0f77bD70a",
          balance: 0
        },
        {
          index: 3,
          address: "0x0A1e7e329E14Dd61734d3182434582FC0A2F5e4E",
          balance: 0
        },
        {
          index: 4,
          address: "0x759476e1BaBBeDa88d51aba92b0752a12e816ED9",
          balance: 0
        }
      ]
    };
  }

  connectToTrezor() {
    if (this.state.accounts.length) {
      return null;
    }
    this.setState({ btnText: "Connecting..." });
    this.props
      .connectHardware("trezor")
      .then(accounts => {
        this.setState({ accounts: accounts, btnText: "Connected to Trezor" });
      })
      .catch(e => {
        this.setState({ btnText: "Connect to Trezor" });
      });
  }

  unlockAccount() {
    log.debug("should unlock account ", this.state.selectedAccount);
    return Promise.resolve();
  }

  handleRadioChange = e => {
    this.setState({
      selectedAccount: e.target.value
    });
  };

  renderAccounts() {
    if (!this.state.accounts.length) {
      return null;
    }

    return h("div.hw-account-list", [
      h("div.hw-account-list__title_wrapper", [
        h("div.hw-account-list__title", {}, ["Select an Address"]),
        h("div.hw-account-list__device", {}, ["Trezor - ETH"])
      ]),
      this.state.accounts.map((a, i) => {
        return h("div.hw-account-list__item", { key: a.address }, [
          h("span.hw-account-list__item__index", a.index + 1),
          h("div.hw-account-list__item__radio", [
            h("input", {
              type: "radio",
              name: "selectedAccount",
              id: `address-${i}`,
              value: i,
              onChange: this.handleRadioChange
            }),
            h(
              "label.hw-account-list__item__label",
              {
                htmlFor: `address-${i}`
              },
              `${a.address.slice(0, 4)}...${a.address.slice(-4)}`
            )
          ]),
          h("span.hw-account-list__item__balance", `${a.balance} ETH`),
          h(
            "a.hw-account-list__item__link",
            {
              href: genAccountLink(a.address, this.props.network),
              target: "_blank"
            },
            "more"
          )
        ]);
      })
    ]);
  }

  render() {
    const { connectHardware, history } = this.props;
    return h("div.new-account-create-form", [
      !this.state.accounts.length
        ? h(
            "button.btn-primary",
            {
              onClick: () => this.connectToTrezor(),
              style: {
                margin: 12
              }
            },
            this.state.btnText
          )
        : null,
      this.renderAccounts(),
      h("div.new-account-create-form__buttons", {}, [
        h(
          "button.btn-default.btn--large.new-account-create-form__button",
          {
            onClick: () => history.push(DEFAULT_ROUTE)
          },
          [this.context.t("cancel")]
        ),

        h(
          "button.btn-primary.btn--large.new-account-create-form__button",
          {
            onClick: () => {
              this.unlockAccount(this.state.selectedAccount).then(() =>
                history.push(DEFAULT_ROUTE)
              );
            }
          },
          [this.context.t("unlock")]
        )
      ]),
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
