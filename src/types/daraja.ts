export interface DarajaAuthSuccessResponse {
  access_token: string
  expires_in: number | string
}

export interface DarajaErrorResponse {
  errorCode?: string
  errorMessage?: string
  error_description?: string
  requestId?: string
  ResponseCode?: string
  ResponseDescription?: string
  ResultCode?: string | number
  ResultDesc?: string
}

export interface DarajaAuthErrorResponse extends DarajaErrorResponse {
  error?: string
}

export interface DarajaStkPushRequest {
  BusinessShortCode: number
  Password: string
  Timestamp: string
  TransactionType: "CustomerPayBillOnline" | "CustomerBuyGoodsOnline"
  Amount: string
  PartyA: string
  PartyB: string
  PhoneNumber: string
  CallBackURL: string
  AccountReference: string
  TransactionDesc: string
}

export interface DarajaStkPushSuccessResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: "0"
  ResponseDescription: string
  CustomerMessage: string
}

export type DarajaAuthResponse = DarajaAuthSuccessResponse | DarajaAuthErrorResponse
export type DarajaStkPushResponse = DarajaStkPushSuccessResponse | DarajaErrorResponse
