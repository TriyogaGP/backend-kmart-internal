const { response, OK, NOT_FOUND, NO_CONTENT } = require('../utils/response.utils');
const excel = require('exceljs')
const { DateTime } = require('luxon')
const { Op } = require('sequelize')
const fs = require('fs')

function getUserGoogle (models) {
  return async (req, res, next) => {
    let { params, startdate, enddate } = req.query
    try {
      startdate = startdate ? startdate : DateTime.local().plus({ day: -7 }).toISODate(),
			enddate = enddate ? enddate : DateTime.local().plus({ day: -1 }).toISODate()
      let dataKumpul = []
      let where = {
        date: {
          [Op.between]: [startdate, enddate]
        }
      }
      if(params == 'install'){
        const data = await models.UserInstall.findAll({
          where,
          order: [
            ['date', 'DESC'],
          ]
        });
  
        await data.map(val => {
          let objectBaru = Object.assign(val.dataValues, {
            install: val.dataValues.install ? JSON.parse([val.dataValues.install]) : null
          });
          return dataKumpul.push(objectBaru)
        })
      }else if(params == 'acquisition'){
        const data = await models.UserAcquisition.findAll({
          where,
          order: [
            ['date', 'DESC'],
          ]
        });
  
        await data.map(val => {
          let objectBaru = Object.assign(val.dataValues, {
            acquisition: val.dataValues.acquisition ? JSON.parse([val.dataValues.acquisition]) : null
          });
          return dataKumpul.push(objectBaru)
        })
      }
      return OK(res, dataKumpul)
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }
}

function updateUserAcquisition (models) {
  return async (req, res, next) => {
    try {
      const data = []
      const workbook = new excel.Workbook()
      await workbook.csv.readFile(req.files[0].path, { parserOptions: { delimiter: ',', quote: '"' } }).then(
        async (worksheet) => {
          const cell = []
          const cellCountry = []
          await worksheet.eachRow({ includeEmpty: true }, async (row, rowNumber) => {
            let noteField = ''
            let subData = {}
            if (rowNumber === 1) {
              const colCount = worksheet.getRow(rowNumber).actualCellCount
              await worksheet.getRow(rowNumber).eachCell((c, ci) => {
                if (ci !== 1 && ci !== colCount) {
                  if (c.value.substr(63) === 'All countries / regions') {
                  } else {
                    cellCountry.push(c.value.substr(63))
                  }
                }
              })
            }else{
              const colCount = cellCountry.length + 3
              await worksheet.getRow(rowNumber).eachCell((c, ci) => {
                if (ci !== 1 && ci !== colCount) {
                  if (ci === 2) {
                    subData['All'] = c.value
                  } else {
                    let key = cellCountry[ci-3].replace(' ', '_')
                    subData[key] = c.value
                  }
                } else
                if (ci === colCount) {
                  noteField = c.value
                }
              })
              data.push({
                date: DateTime.fromFormat(worksheet.getCell(`A${rowNumber}`).value, "MMM d, yyyy").toISODate(),
                acquisition: subData,
                notes: noteField
              })
            }
          })
          data.map(async val => {
            const count = await models.UserAcquisition.count({where: { date: val.date }});
            let kirimdata = {
              date: val.date,
              acquisition: JSON.stringify(val.acquisition),
              notes: val.notes,
            }
            if(count) {
              await models.UserAcquisition.update(kirimdata, {where: { date: val.date }})
            } else {
              await models.UserAcquisition.create(kirimdata)
            }
          })

          fs.unlinkSync(req.files[0].path)
          return OK(res, data);
        }
      ).catch(e => {
        fs.unlinkSync(req.files[0].path)
        return NOT_FOUND(res, e.message)
      })
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }
}

function updateUserInstall (models) {
  return async (req, res, next) => {
    try {
      const data = []
      const workbook = new excel.Workbook()
      await workbook.csv.readFile(req.files[0].path, { parserOptions: { delimiter: ',', quote: '"' } }).then(
        async (worksheet) => {
          const cell = []
          const cellCountry = []
          await worksheet.eachRow({ includeEmpty: true }, async (row, rowNumber) => {
            let noteField = ''
            let subData = {}
            if (rowNumber === 1) {
              const colCount = worksheet.getRow(rowNumber).actualCellCount
              await worksheet.getRow(rowNumber).eachCell((c, ci) => {
                if (ci !== 1 && ci !== colCount) {
                  if (c.value.substr(67) === 'All countries / regions') {
                  } else {
                    cellCountry.push(c.value.substr(67))
                  }
                }
              })
            }else{
              const colCount = cellCountry.length + 3
              await worksheet.getRow(rowNumber).eachCell((c, ci) => {
                if (ci !== 1 && ci !== colCount) {
                  if (ci === 2) {
                    subData['All'] = c.value
                  } else {
                    let key = cellCountry[ci-3].replace(' ', '_')
                    subData[key] = c.value
                  }
                } else
                if (ci === colCount) {
                  noteField = c.value
                }
              })
              data.push({
                date: DateTime.fromFormat(worksheet.getCell(`A${rowNumber}`).value, "MMM d, yyyy").toISODate(),
                install: subData,
                notes: noteField
              })
            }
          })
          data.map(async val => {
            const count = await models.UserInstall.count({where: { date: val.date }});
            let kirimdata = {
              date: val.date,
              install: JSON.stringify(val.install),
              notes: val.notes,
            }
            if(count) {
              await models.UserInstall.update(kirimdata, {where: { date: val.date }})
            } else {
              await models.UserInstall.create(kirimdata)
            }
          })

          fs.unlinkSync(req.files[0].path)
          return OK(res);
        }
      ).catch(e => {
        fs.unlinkSync(req.files[0].path)
        return NOT_FOUND(res, e.message)
      })
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }
}

module.exports = {
  getUserGoogle,
  updateUserAcquisition,
  updateUserInstall
}