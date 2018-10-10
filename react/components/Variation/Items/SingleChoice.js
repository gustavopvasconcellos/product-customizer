import PropTypes from 'prop-types'
import React, { Component } from 'react'
import SuccessIcon from 'vtex.styleguide/IconSuccess'
import ProductPrice from 'vtex.store-components/ProductPrice'

class SingleChoice extends Component {
  static propTypes = {
    index: PropTypes.number,
    selected: PropTypes.bool,
    onSelectItem: PropTypes.func,
    onVariationChange: PropTypes.func,
    item: PropTypes.object.isRequired,
  }

  handleVariationChange = () => {
    const {
      item,
      index,
      onSelectItem,
      onVariationChange,
    } = this.props

    onSelectItem(index)
    onVariationChange(item, 1)

    this.setState({ selected: true })
  }

  render() {
    const {
      item,
      selected,
    } = this.props

    return (
      <label>
        <div className={`vtex-product-customizer__single-choice ${selected ? 'selected bg-washed-blue' : ''} flex items-center justify-between pa5 pointer`}>
          <div className="flex">
            <div className="single-choice__image-container mr4">
              <input
                type="radio"
                className="dn"
                name="input-single-choice"
                value={item.id}
                onChange={this.handleVariationChange}
              />
              <img className={`single-choice_image-thumb br3 ${selected ? 'ba b--action-primary' : ''}`} src="https://via.placeholder.com/72x72" />
              <div className="single-choice__icon-container dn">
                <SuccessIcon size={16} />
              </div>
            </div>
            <div className="single-choice__content flex flex-column justify-center">
              <div className="single-choice__title">Variation</div>
              <div className="single-choice__description pt2 mid-gray fw2">Description</div>
            </div>
          </div>
          <div className="single-choice__price mh4 w3 near-black tc">
            <ProductPrice
              showLabels={false}
              showListPrice={false}
              sellingPrice={19.90}
              listPrice={19.90}
            />
          </div>
        </div>
      </label>
    )
  }
}

export default SingleChoice
