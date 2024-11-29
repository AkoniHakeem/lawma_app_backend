"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryDataSeeds1703254123976 = void 0;
const CountryData_json_1 = __importDefault(require("../../../lib/CountryData.json"));
const country_entity_1 = require("../../../utils-billing/entitties/country.entity");
const currency_entity_1 = require("../../../utils-billing/entitties/currency.entity");
const phoneCode_entity_1 = require("../../../utils-billing/entitties/phoneCode.entity");
const common_1 = require("@nestjs/common");
class CountryDataSeeds1703254123976 {
    up(queryRunner) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            //
            const dbManager = queryRunner.manager;
            //
            function getCountries() {
                return new Promise((resolve, reject) => {
                    try {
                        const countries = Object.entries(CountryData_json_1.default.country_formats.name_to_alpha3);
                        resolve(countries);
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            }
            function getCountriesDetails(nameCode) {
                return new Promise((resolve, reject) => {
                    try {
                        const country = CountryData_json_1.default.country[nameCode];
                        resolve(country);
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            }
            const countries = (yield getCountries());
            try {
                for (var _d = true, countries_1 = __asyncValues(countries), countries_1_1; countries_1_1 = yield countries_1.next(), _a = countries_1_1.done, !_a; _d = true) {
                    _c = countries_1_1.value;
                    _d = false;
                    const [countryName, countryAlpha3] = _c;
                    //
                    common_1.Logger.log(`Processing country: ${countryName}`);
                    let country = new country_entity_1.Country();
                    country.fullname = countryName;
                    country.name = countryAlpha3;
                    country = yield dbManager.save(country);
                    const countryDetail = yield getCountriesDetails(country.name);
                    const currencies = countryDetail.currency.currencyCode.map((currencyCode, index) => {
                        const currency = new currency_entity_1.Currency();
                        currency.name = currencyCode;
                        currency.symbol = countryDetail.currency.currencySymbol[index];
                        currency.fullname = countryDetail.currency.currencyName[index];
                        currency.countryId = country.id;
                        return currency;
                    });
                    yield dbManager.save(currencies);
                    if (countryDetail.phone.countryCode) {
                        const phoneCode = new phoneCode_entity_1.PhoneCode();
                        phoneCode.name = countryDetail.phone.countryCode;
                        phoneCode.countryId = country.id;
                        yield dbManager.save(phoneCode);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = countries_1.return)) yield _b.call(countries_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            //
        });
    }
}
exports.CountryDataSeeds1703254123976 = CountryDataSeeds1703254123976;
