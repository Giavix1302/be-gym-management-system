import { productModel } from '../models/product.model.js'

const addProduct = async (req) => {
  try {
    // handle data
    //const { productName, price, description, category, color } = req.body
    const image = req.file

    const product = {
      ...req.body,
      imgUrl: image.path,
      color: JSON.parse(req.body.color)
    }

    // create product
    await productModel.createNew(product)
    const listProduct = await productModel.getListProduct()

    return {
      success: true,
      message: 'Product created successfully',
      data: [...listProduct]
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getListProduct = async () => {
  try {
    const listProduct = await productModel.getListProduct()

    return {
      success: true,
      data: [...listProduct]
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateProduct = async (req) => {
  try {
    const productId = req.params.id
    const image = req.file

    const updateData = {
      ...req.body,
      ...(image && { imgUrl: image.path }),
      color: JSON.parse(req.body.color),
      updatedAt: Date.now()
    }

    const result = await productModel.updateProduct(productId, updateData)
    const listProduct = await productModel.getListProduct()

    if (result === null) {
      return {
        success: false,
        message: 'Product doesn\'t exist.',
      }
    }

    return {
      success: true,
      message: 'Product updated successfully',
      data: [...listProduct]
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteProduct = async (productId) => {
  try {
    // handle data
    const result = await productModel.deleteProduct(productId)
    const listProduct = await productModel.getListProduct()
    return {
      success: result === 1,
      message: result === 1 ? 'Delete done!' : 'Delete false!',
      data: result === 1 ? [...listProduct] : ''
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const productService = {
  addProduct,
  updateProduct,
  deleteProduct,
  getListProduct
}