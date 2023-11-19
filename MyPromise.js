const STATE = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
}

class MyPromise {
  #thenCbs = []
  #catchCbs = []
  #state = STATE.PENDING
  #value = undefined
  #onSuccessBinded = this.#onSuccess.bind(this)
  #onFailBinded = this.#onFail.bind(this)

  constructor(cb) {
    try {
      cb(this.#onSuccessBinded, this.#onFailBinded)
    } catch (e) {
      this.#onFail(e)
    }
  }

  #runCallBacks() {
    if (this.#state === STATE.FULFILLED) {
      this.#thenCbs.forEach((cb) => {
        cb(this.#value)
      })
      this.#thenCbs = []
    }
    if (this.#state === STATE.REJECTED) {
      this.#catchCbs.forEach((cb) => {
        cb(this.#value)
      })
      this.#catchCbs = []
    }
  }

  #onSuccess(value) {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return

      if (value instanceof MyPromise) {
        value.then(this.#onSuccessBinded, this.#onFailBinded)
        return
      }
      this.#value = value
      this.#state = STATE.FULFILLED
      this.#runCallBacks()
    })
  }

  #onFail(value) {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return

      if (value instanceof MyPromise) {
        value.then(this.#onSuccessBinded, this.#onFailBinded)
        return
      }

      if (this.#catchCbs.length === 0) {
        throw new UncaughtPromiseError(value)
      }
      this.#value = value
      this.#state = STATE.REJECTED
      this.#runCallBacks()
    })
  }

  then(thenCb, catchCb) {
    return new MyPromise((resolve, reject) => {
      this.#thenCbs.push((res) => {
        if (!thenCb) {
          resolve(res)
          return
        }
        try {
          resolve(thenCb(res))
        } catch (e) {
          reject(e)
        }
      })

      this.#catchCbs.push((res) => {
        if (!catchCb) {
          resolve(res)
          return
        }
        try {
          resolve(catchCb(res))
        } catch (e) {
          reject(e)
        }
      })

      this.#runCallBacks()
    })
  }

  catch(cb) {
    return this.then(undefined, cb)
  }

  finally(cb) {
    return this.then(
      (res) => {
        cb()
        return res
      },
      (res) => {
        cb()
        throw res
      },
    )
  }

  static resolve(val) {
    return new Promise((resolve) => {
      resolve(val)
    })
  }

  static reject(val) {
    return new Promise((resolve, reject) => {
      reject(val)
    })
  }
}

class UncaughtPromiseError extends Error {
  constructor(error) {
    super(error)

    this.stack = `(in promise) ${error.stack}`
  }
}

module.exports = MyPromise
