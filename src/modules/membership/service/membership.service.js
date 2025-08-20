import { membershipModel } from '../model/membership.model'
import { sanitize } from '~/utils/utils'

const addMembership = async (req) => {
  try {
    // check duplicate

    // handle data
    const image = req.file
    const { imgUrl, ...rest } = req.body

    const product = {
      ...rest,
      bannerURL: image.path,
    }
    console.log('🚀 ~ addMembership ~ product:', product)

    // create membership
    const result = await membershipModel.createNew(product)

    // Get the newly created membership
    const membership = await membershipModel.getDetail(result.insertedId)
    return {
      success: true,
      message: 'Membership created successfully',
      membership: sanitize(membership),
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getListProduct = async () => {
  try {
    // const listProduct = await productModel.getListProduct()
    const a = 1231
    return {
      success: true,
      // data: [...listProduct]
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateProduct = async (req) => {
  try {
    // const productId = req.params.id
    // const image = req.file

    // const updateData = {
    //   ...req.body,
    //   ...(image && { imgUrl: image.path }),
    //   color: JSON.parse(req.body.color),
    //   updatedAt: Date.now(),
    // }

    // const result = await productModel.updateProduct(productId, updateData)
    // const listProduct = await productModel.getListProduct()

    // if (result === null) {
    //   return {
    //     success: false,
    //     message: "Product doesn't exist.",
    //   }
    // }

    return {
      success: true,
      message: 'Product updated successfully',
      // data: [...listProduct],
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteProduct = async (productId) => {
  try {
    // handle data
    // const result = await productModel.deleteProduct(productId)
    // const listProduct = await productModel.getListProduct()
    return {
      // success: result === 1,
      // message: result === 1 ? 'Delete done!' : 'Delete false!',
      // data: result === 1 ? [...listProduct] : '',
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const membershipService = {
  addMembership,
}
