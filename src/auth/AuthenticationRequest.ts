import Config from '@/config/Config'
import { Method } from '@/communication/Constants'

export interface AuthenticationRequestVars {
  state: string
  nonce: string
}

export default class AuthenticationRequest {
  private static get TMP_STORAGE_KEY(): string {
    return 'Authentication-Request-variables'
  }

  get stateVariable(): string {
    return this.request.state
  }
  get nonceVariable(): string {
    return this.request.nonce
  }

  private request: any
  private endpoint: string = Config.authServer + '/authorize/'

  constructor() {
    this.request = {
      scope: 'openid user-client',
      response_type: 'id_token token',
      client_id: Config.clientId,
      redirect_uri: Config.authCallback,
      state: this.randomString(),
      nonce: this.randomString(),
    }
  }

  public static persistVariables(request: AuthenticationRequest): void {
    const toPersist = {
      state: request.stateVariable,
      nonce: request.nonceVariable,
    }
    sessionStorage.setItem(AuthenticationRequest.TMP_STORAGE_KEY, JSON.stringify(toPersist))
  }

  public static loadVariablesAndDelete(): AuthenticationRequestVars {
    const loaded = sessionStorage.getItem(AuthenticationRequest.TMP_STORAGE_KEY)
    if (loaded) {
      sessionStorage.removeItem(AuthenticationRequest.TMP_STORAGE_KEY)
      return JSON.parse(loaded) as AuthenticationRequestVars
    } else {
      return {
        state: '',
        nonce: '',
      }
    }
  }

  public submit(): void {
    const form = document.createElement('form')
    form.setAttribute('method', Method.GET)
    form.setAttribute('action', this.endpoint)

    for (const key in this.request) {
      if (this.request.hasOwnProperty(key)) {
        const value = (this.request as any)[key]
        form.appendChild(this.createInput(key, value))
      }
    }

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  private createInput(key: string, value: string): HTMLInputElement {
    const input = document.createElement('input')
    input.setAttribute('type', 'hidden')
    input.setAttribute('name', key)
    input.setAttribute('value', value)
    return input
  }

  private randomString(): string {
    const randomValues = new Int32Array(5)
    window.crypto.getRandomValues(randomValues)
    let result: string = ''
    randomValues.forEach(value => (result += value.toString()))
    return result
  }
}
