const STATE = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
}

class MyPromise {
  callbacks = []
  state = STATE.PENDING
  value = undefined

  constructor(callback) {
    try {
      callback(this.onSuccess, this.onFail)
    } catch (err) {
      MyPromise.onFail(err)
    }
  }

  runCallBacks() {
    if (this.state === STATE.PENDING) {
      return
    }
    this.callbacks.forEach((cb) => {
      if (this.state === STATE.FULFILLED) {
        return cb.onSuccess(this.value)
      } else {
        return cb.onFail(this.value)
      }
    })
    this.callbacks = []
  }

  static onSuccess(value) {
    // only process a promise when it's still pending
    if (this.state !== STATE.PENDING) {
      return
    }
    this.value = value
    this.state = STATE.PENDING
    this.runCallBacks()
  }

  static onFail(value) {
    if (this.state !== STATE.PENDING) {
      return
    }
    this.value = value
    this.state = STATE.REJECTED
    this.runCallBacks()
  }

  then(callback) {
    this.callbacks.push(callback)
    this.runCallBacks()
  }
}

module.exports = MyPromise

const p = new Promise((resolve, reject) => {
  resolve(500)
  resolve(10)
  resolve(10)
  reject('error')
})
p.then()

p.then()
