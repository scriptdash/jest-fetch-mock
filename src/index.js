/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Implements basic mock for the fetch interface use `whatwg-fetch` polyfill.
 *
 * See https://fetch.spec.whatwg.org/
 */

/* eslint-env jest, browser */

module.exports = ({ Headers, Request, Response } = global) => {
  const ActualResponse = Response
  function ResponseWrapper(body, init) {
    if (
      typeof body.constructor === 'function' &&
      body.constructor.__isFallback
    ) {
      const response = new ActualResponse(null, init)
      response.body = body

      const actualClone = response.clone
      response.clone = () => {
        const clone = actualClone.call(response)
        const [body1, body2] = body.tee()
        response.body = body1
        clone.body = body2
        return clone
      }

      return response
    }

    return new ActualResponse(body, init)
  }

  const fetch = jest.fn()
  fetch.Headers = Headers
  fetch.Response = ResponseWrapper
  fetch.Request = Request

  fetch.mockResponse = (body, init) => {
    return fetch.mockImplementation(
      () => Promise.resolve(new fetch.Response(body, init))
    )
  }

  fetch.mockReject = () => {
    return fetch.mockImplementation(
      () => Promise.reject()
    )
  }

  fetch.mockResponseOnce = (body, init) => {
    return fetch.mockImplementationOnce(
      () => Promise.resolve(new fetch.Response(body, init))
    )
  }


  fetch.mockRejectOnce = () => {
    return fetch.mockImplementationOnce(
      () => Promise.reject()
    )
  }

  fetch.mockResponses = (...responses) => {
    return responses.map(([body, init]) => {
      return fetch.mockImplementationOnce(
        () => Promise.resolve(new fetch.Response(body, init))
      )
    })
  }

  fetch.resetMocks = () => {
    fetch.mockReset()
  }

  // Default mock is just a empty string.
  fetch.mockResponse('')

  return fetch
}


