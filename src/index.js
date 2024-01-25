module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('telegraph-image-uploader', {
      handle,
      name: 'telegraph-image',
      config: config
    })
  }
  const handle = async function (ctx) {
    let userConfig = ctx.getConfig('picBed.telegraph-image-uploader')
    if (!userConfig) {
      throw new Error('Can\'t find uploader config')
    }
    const url = userConfig.customUrl
    const uploadUrl = userConfig.customUrl + '/upload'
    const paramName = "file"
    try {
      let imgList = ctx.output
      for (let i in imgList) {
        let image = imgList[i].buffer
        if (!image && imgList[i].base64Image) {
          image = Buffer.from(imgList[i].base64Image, 'base64')
        }
        const postConfig = postOptions(image, uploadUrl, paramName, imgList[i].fileName)
        let body = await ctx.Request.request(postConfig)

        delete imgList[i].base64Image
        delete imgList[i].buffer
        let imgUrl = url + JSON.parse(body)[0].src
        if (imgUrl) {
          imgList[i]['imgUrl'] = imgUrl
        } else {
          ctx.emit('notification', {
            title: '返回解析失败',
            body: body
          })
        }
      }
    } catch (err) {
      ctx.emit('notification', {
        title: '上传失败',
        body: JSON.stringify(err)
      })
    }
  }

  const postOptions = (image, url, paramName, fileName) => {
    let headers = {
      contentType: 'multipart/form-data',
      'User-Agent': 'PicGo'
    }
    let formData = {}
    const opts = {
      method: 'POST',
      url: url,
      headers: headers,
      formData: formData
    }
    opts.formData[paramName] = {}
    opts.formData[paramName].value = image
    opts.formData[paramName].options = {
      filename: fileName
    }
    return opts
  }

  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.telegraph-image-uploader')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'customUrl',
        type: 'input',
        default: userConfig.customUrl,
        required: true,
        message: '图片上传url(eg: https://tc.bian666.cf)',
        alias: 'URL'
      },
      {
        name: 'customHeader',
        type: 'input',
        default: userConfig.customHeader,
        required: false,
        message: '自定义请求头 标准JSON(eg: {"key":"value"})',
        alias: '自定义请求头'
      },
      {
        name: 'customBody',
        type: 'input',
        default: userConfig.customBody,
        required: false,
        message: '自定义Body 标准JSON(eg: {"key":"value"})',
        alias: '自定义Body'
      }
    ]
  }
  return {
    uploader: 'telegraph-image-uploader',
    register

  }
}
