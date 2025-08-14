import { accountModel } from '../models/account.model.js'
import { userService } from './user.service.js'
import { handleHashedPassword, isMatch } from '../utils/bcrypt.js'
import { signToken } from '../utils/jwt.js'
import { productModel } from '../models/product.model.js'

const addToCart = async (req) => {
  try {
    // handle data
    //const { productName, price, description, category, color } = req.body
    const image = req.file

    const product = {
      ...req.body,
      imgUrl: image.path

    }
    // create product
    const result = await productModel.createNew(product)
    console.log('🚀 ~ addProduct ~ result:', result)
    const createdProduct = await productModel.getDetail(result.insertedId)

    return {
      success: true,
      message: 'Signed in successfully.',
      data: {
        ...createdProduct
      }
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getListCartDetail = async (reqBody) => {
  try {
    const hihi = reqBody

    return {
      success: true,
      message: 'Account created successfully',
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateQuantity = async (cartDetailId, quantity) => {
  try {
    const id = cartDetailId
    // find cartDetail

    // update quantity

    // return list cart detail
    return {
      success: true,
      message: 'Account created successfully',

    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteCartDetail = async (cartDetailId) => {
  try {
    // handle data
    const id = cartDetailId

    return {
      success: true,
      message: 'Account created successfully',

    }
  } catch (error) {
    throw new Error(error)
  }
}

export const cartService = {
  addToCart,
  getListCartDetail,
  deleteCartDetail,
  updateQuantity
}