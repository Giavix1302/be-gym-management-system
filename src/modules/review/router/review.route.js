import express from 'express'
import { reviewController } from '../controller/review.controller'
import { upload } from '~/config/cloudinary.config'
import { reviewValidation } from '../validation/review.validation'

const Router = express.Router()

Router.route('/').post(upload.array('reviewImgs', 6), reviewController.createNew)

Router.route('/:id')
  .get(reviewController.getDetail)
  .put(reviewValidation.updateInfo, reviewController.updateInfo) // update name, phone and address
  .delete(reviewController.deleteReview)

export const reviewRoute = Router
