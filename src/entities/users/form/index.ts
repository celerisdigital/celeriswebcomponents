export { PhoneSection } from './phone-section'
export { AddressSection } from './address-section'
export { BankAccountSection } from './bank-account-section'
export { useBankHolder } from './use-bank-holder'
export type { BankHolder } from './use-bank-holder'
export { useDocumentLookup } from './use-document-lookup'
export {
  addressSchema,
  bankAccountSchema,
  phoneSchema,
  PIX_KIND_OPTIONS,
  buildContactExtraData,
  toAddressValues,
  toBankAccountValues,
  toPhoneValue,
} from './schemas'
export type { AddressValues, BankAccountValues, ContactValues } from './schemas'
