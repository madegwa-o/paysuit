import { Schema, model, models, type Model, type Document, Types } from "mongoose"

export type PaymentProvider = "PAYSUIT" | "MALIPO"
export type PaymentFlow = "PAYSUIT_RECHARGE" | "MALIPO_C2B"
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED"

export interface IPayment extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  provider: PaymentProvider
  flow: PaymentFlow
  phoneNumber: string
  amount: number
  fee: number
  currency: string
  status: PaymentStatus
  merchantRequestID?: string
  checkoutRequestID?: string
  resultCode?: number
  resultDesc?: string
  rawResponse?: Record<string, unknown>
  callbackPayload?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, enum: ["PAYSUIT", "MALIPO"], required: true },
    flow: { type: String, enum: ["PAYSUIT_RECHARGE", "MALIPO_C2B"], required: true },
    phoneNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    currency: { type: String, default: "KES" },
    status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING", index: true },
    merchantRequestID: { type: String, index: true },
    checkoutRequestID: { type: String, index: true },
    resultCode: { type: Number },
    resultDesc: { type: String },
    rawResponse: { type: Schema.Types.Mixed, default: null },
    callbackPayload: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
)

PaymentSchema.index({ userId: 1, createdAt: -1 })
PaymentSchema.index({ checkoutRequestID: 1 }, { unique: true, sparse: true })

export const Payment: Model<IPayment> = models.Payment || model<IPayment>("Payment", PaymentSchema)
