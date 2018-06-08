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
      accounts: []
    };
  }

  connectToTrezor() {
    if (this.state.accounts.length) {
      return null;
    }
    this.setState({ btnText: "Connecting..." });
    this.getPage();
  }

  getPage(page = 1) {
    this.props
      .connectHardware("trezor", page)
      .then(accounts => {
        if (accounts.length) {
          this.setState({ accounts: accounts });
        }
      })
      .catch(e => {
        this.setState({ btnText: "Connect to Trezor" });
      });
  }

  unlockAccount() {
    if (this.state.selectedAccount === "") {
      return Promise.reject({ error: "You need to select an account!" });
    }
    log.debug("should unlock account ", this.state.selectedAccount);
    return Promise.resolve();
  }

  handleRadioChange = e => {
    log.debug("Selected account with index ", e.target.value);

    this.setState({
      selectedAccount: e.target.value,
      error: null
    });
  };

  renderAccounts() {
    if (!this.state.accounts.length) {
      return null;
    }
    log.debug("ACCOUNTS : ", this.state.accounts);
    log.debug("SELECTED?", this.state.selectedAccount);

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
              value: a.index,
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
              target: "_blank",
              title: this.context.t("etherscanView")
            },
            h("img", { src: "images/popout.svg" })
          )
        ]);
      })
    ]);
  }

  renderPagination() {
    if (!this.state.accounts.length) {
      return null;
    }
    return h("div.hw-list-pagination", [
      h(
        "button.btn-default.hw-list-pagination__button",
        {
          onClick: () => this.getPage(-1)
        },
        "< Prev"
      ),

      h(
        "button.btn-default.hw-list-pagination__button",
        {
          onClick: () => this.getPage()
        },
        "Next >"
      )
    ]);
  }

  renderButtons() {
    if (!this.state.accounts.length) {
      return null;
    }
    const { history } = this.props;

    return h("div.new-account-create-form__buttons", {}, [
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
            this.unlockAccount(this.state.selectedAccount)
              .then(() => history.push(DEFAULT_ROUTE))
              .catch(e => {
                this.setState({ error: e.error });
              });
          }
        },
        [this.context.t("unlock")]
      )
    ]);
  }

  renderError() {
    return this.state.error
      ? h("span.error", { style: { margin: 12 } }, this.state.error)
      : null;
  }

  render() {
    return h("div.new-account-create-form", [
      !this.state.accounts.length
        ? h(
            "button.btn-primary.btn--large",
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
      this.renderPagination(),
      this.renderButtons(),
      this.renderError()
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
    connectHardware: (deviceName, page) => {
      return dispatch(actions.connectHardware(deviceName, page));
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
