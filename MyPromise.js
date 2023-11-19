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
      callback(this.onSuccess.bind(this), this.onFail.bind(this))
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
      }
      return cb.onFail(this.value)
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

  addCallBacks(callbacks) {
    this.callbacks.push(callbacks)
    this.runCallBacks()
  }

  then(onSuccess, onFail) {
    if (!onSuccess) this.callbacks.push(onSuccess)
    if (!onFail) this.callbacks.push(onFail)
    this.runCallBacks()
    // return new MyPromise((resolve, reject) => {
    //   this.addCallBacks({
    //     onSuccess: (result) => {
    //         console.log('result=', result)
    //       if (!onSuccess) {
    //         return resolve(result)
    //       }

    //       try {
    //         return resolve(onSuccess(result))
    //       } catch (err) {
    //         return reject(err)
    //       }
    //     },
    //     onFail: (result) => {
    //       if (!onFail) {
    //         return reject(result)
    //       }

    //       try {
    //         return resolve(onFail(result))
    //       } catch (err) {
    //         return reject(err)
    //       }
    //     },
    //   })
    // })
  }

  catch(callback) {
    this.then(undefined, callback)
  }

  finally(callback) {}
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
