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
exports.PropertySubscriptionSeeding1707468746527 = void 0;
const GRSExcel_json_1 = __importDefault(require("../../../lib/GRSExcel.json"));
const propertySubscription_entity_1 = require("../../../utils-billing/entitties/propertySubscription.entity");
const enums_1 = require("../../../lib/enums");
const entityProfile_entity_1 = require("../../../utils-billing/entitties/entityProfile.entity");
const entityUserProfile_entity_1 = require("../../../utils-billing/entitties/entityUserProfile.entity");
const profileCollection_entity_1 = require("../../../utils-billing/entitties/profileCollection.entity");
const axios_1 = __importDefault(require("axios"));
const lodash_1 = require("lodash");
const lga_entity_1 = require("../../../utils-billing/entitties/lga.entity");
const lgaWard_entity_1 = require("../../../utils-billing/entitties/lgaWard.entity");
const street_entity_1 = require("../../../utils-billing/entitties/street.entity");
const entitySubscriberProfile_entity_1 = require("../../../utils-billing/entitties/entitySubscriberProfile.entity");
const propertyTypes_entity_1 = require("../../../utils-billing/entitties/propertyTypes.entity");
const entitySubscriberProperty_entity_1 = require("../../../utils-billing/entitties/entitySubscriberProperty.entity");
const PropertySubscriptionUnit_entity_1 = require("../../../utils-billing/entitties/PropertySubscriptionUnit.entity");
const billingAccount_entity_1 = require("../../../utils-billing/entitties/billingAccount.entity");
const class_validator_1 = require("class-validator");
class PropertySubscriptionSeeding1707468746527 {
    up(queryRunner) {
        var _a, e_1, _b, _c;
        var _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //
                const dbManager = queryRunner.manager;
                function getStreetNumber(streetData) {
                    var _a, _b, _c, _d;
                    const streetNumber = (_d = (_c = (_b = (_a = String(streetData || '')) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.split(/\s{1,}/)) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.trim();
                    return streetNumber || '';
                }
                function getStreetName(streetData) {
                    var _a, _b;
                    const streetDataArray = (_b = (_a = String(streetData || '')) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.split(/\s{1,}/);
                    streetDataArray.shift();
                    const streetName = streetDataArray.join().trim();
                    return streetName || '';
                }
                function requestAuth(body) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const authToken = process.env.AUTH_SERVER_API_ACCESS_TOKEN;
                        const baseURL = process.env.AUTH_SERVER_URL;
                        const path = '/project/app/signup';
                        const Authorization = `Bearer ${authToken}`;
                        const response = yield axios_1.default.post(path, body, {
                            headers: { Authorization },
                            baseURL,
                        });
                        return (0, lodash_1.pick)(response, ['data', 'headers', 'request', 'status']);
                    });
                }
                function getAddSubscriber(accountName, propertyCode) {
                    var _a, _b, _c, _d, _e;
                    return __awaiter(this, void 0, void 0, function* () {
                        accountName =
                            ((_b = (((_a = String(accountName || '')) === null || _a === void 0 ? void 0 : _a.trim()) || '')) === null || _b === void 0 ? void 0 : _b.replace(/\s{1,}/g, '_')) ||
                                '';
                        accountName = (_d = (((_c = String(accountName || '')) === null || _c === void 0 ? void 0 : _c.trim()) || '')) === null || _d === void 0 ? void 0 : _d.replace(/[\W\s]{1,}/g, '');
                        propertyCode = (_e = ((propertyCode === null || propertyCode === void 0 ? void 0 : propertyCode.trim()) || '')) === null || _e === void 0 ? void 0 : _e.replace(/[\W\s]{1,}/g, '');
                        const serverResponse = yield requestAuth({
                            firstName: accountName || '',
                            lastName: propertyCode,
                            email: `${propertyCode}_${accountName}@grs.com`,
                            password: 'no-password',
                            initiateVerificationRequest: false,
                        });
                        if ([200, 201].includes(serverResponse.status)) {
                            return Object.assign({}, serverResponse.data);
                        }
                    });
                }
                function getPropertyType(propertyTypeUnitData) {
                    const propertyTypesArr = propertyTypeUnitData.split('/');
                    const propertyTypes = propertyTypesArr.reduce((prev, curr) => {
                        const propertyUnitsTypeArray = curr.split(/\s{1,}/);
                        prev[propertyUnitsTypeArray[1] || 'typename'] =
                            propertyUnitsTypeArray[0] || '1';
                        return prev;
                    }, {});
                    return propertyTypes;
                }
                const authServerResponse = yield requestAuth({
                    firstName: 'Olanyinka',
                    lastName: 'Yusuf',
                    email: 'goldenrisingsunltd@hotmail.com',
                    password: 'no-password',
                    initiateVerificationRequest: false,
                });
                let userData;
                if ([200, 201].includes(authServerResponse.status)) {
                    userData = authServerResponse.data;
                    let grsEntity = new entityProfile_entity_1.EntityProfile();
                    grsEntity.name = 'Golden Rising Sun Ventures l.t.d. (GRS)';
                    grsEntity =
                        (yield dbManager.findOne(entityProfile_entity_1.EntityProfile, {
                            where: { name: grsEntity.name },
                        })) || (yield dbManager.save(grsEntity));
                    let grsUserProfile = new entityUserProfile_entity_1.EntityUserProfile();
                    grsUserProfile.firstName = 'Olayinka';
                    grsUserProfile.lastName = 'Yusuf';
                    grsUserProfile.email = 'goldenrisingsunltd@hotmail.com';
                    grsUserProfile.entityProfileId = grsEntity.id;
                    grsUserProfile =
                        (yield dbManager.findOne(entityUserProfile_entity_1.EntityUserProfile, {
                            where: { email: grsUserProfile.email },
                        })) || (yield dbManager.save(grsUserProfile));
                    const profileSummary = new profileCollection_entity_1.ProfileCollection();
                    profileSummary.profileType = enums_1.ProfileTypes.ENTITY_USER_PROFILE;
                    profileSummary.profileTypeId = grsUserProfile.id;
                    profileSummary.userId = userData.id;
                    profileSummary.isAdmin = true;
                    (yield dbManager.findOne(profileCollection_entity_1.ProfileCollection, {
                        where: {
                            profileTypeId: profileSummary.profileTypeId,
                            profileType: enums_1.ProfileTypes.ENTITY_USER_PROFILE,
                        },
                    })) || (yield dbManager.save(profileSummary));
                    let lga = new lga_entity_1.Lga();
                    lga.name = 'Alimosho Local Government Area';
                    lga.abbreviation = 'ALIMOSHO';
                    lga =
                        (yield dbManager.findOne(lga_entity_1.Lga, { where: { name: lga.name } })) ||
                            (yield dbManager.save(lga));
                    let lgaWard = new lgaWard_entity_1.LgaWard();
                    lgaWard.name = 'WARD B';
                    lgaWard.lgaId = lga.id;
                    lgaWard =
                        (yield dbManager.findOne(lgaWard_entity_1.LgaWard, {
                            where: { name: lgaWard.name },
                        })) || (yield dbManager.save(lgaWard));
                    try {
                        for (var _h = true, GRSDebtorListJSON_1 = __asyncValues(GRSExcel_json_1.default), GRSDebtorListJSON_1_1; GRSDebtorListJSON_1_1 = yield GRSDebtorListJSON_1.next(), _a = GRSDebtorListJSON_1_1.done, !_a; _h = true) {
                            _c = GRSDebtorListJSON_1_1.value;
                            _h = false;
                            const debtor = _c;
                            console.log(debtor['Code']);
                            debtor['Code'] = String(debtor['Code']);
                            //
                            let street = new street_entity_1.Street();
                            street.name = getStreetName(debtor['Property Number/Street']);
                            street.lgaWardId = lgaWard.id;
                            street.entityProfileId = grsEntity.id;
                            street =
                                (yield dbManager.findOne(street_entity_1.Street, {
                                    where: { name: street.name },
                                })) || (yield dbManager.save(street));
                            const userProfile = yield getAddSubscriber(debtor['Acount Name'], debtor.Code);
                            let entitySubscriberProfile = new entitySubscriberProfile_entity_1.EntitySubscriberProfile();
                            entitySubscriberProfile.firstName = userProfile.firstName;
                            entitySubscriberProfile.lastName = userProfile.lastName;
                            entitySubscriberProfile.email = userProfile.email;
                            entitySubscriberProfile.createdByEntityUserProfileId = grsEntity.id;
                            entitySubscriberProfile =
                                (yield dbManager.findOne(entitySubscriberProfile_entity_1.EntitySubscriberProfile, {
                                    where: { email: entitySubscriberProfile.email },
                                })) || (yield dbManager.save(entitySubscriberProfile));
                            let propertySubscription = new propertySubscription_entity_1.PropertySubscription();
                            propertySubscription.propertySubscriptionName =
                                `${debtor.Code} ${debtor['Acount Name']}`.trim() || 'GRS Prop';
                            propertySubscription.oldCode =
                                ((_d = debtor.Code) === null || _d === void 0 ? void 0 : _d.trim()) || Date.now().toString();
                            propertySubscription.subscriberProfileRole =
                                enums_1.SubscriberProfileRoleEnum.OWNER;
                            propertySubscription.streetNumber =
                                ((_e = getStreetNumber(debtor['Property Number/Street'])) === null || _e === void 0 ? void 0 : _e.trim()) || '1';
                            propertySubscription.streetId = street.id;
                            propertySubscription.entityProfileId = grsEntity.id;
                            propertySubscription.entitySubscriberProfileId =
                                entitySubscriberProfile.id;
                            propertySubscription =
                                (yield dbManager.findOne(propertySubscription_entity_1.PropertySubscription, {
                                    where: {
                                        propertySubscriptionName: propertySubscription.propertySubscriptionName,
                                    },
                                })) || (yield dbManager.save(propertySubscription));
                            // create property types and units
                            const propertyTypeUnitData = getPropertyType(debtor['Property Units'] || '1 typename');
                            for (const [key, value] of Object.entries(propertyTypeUnitData)) {
                                // create property type
                                let propertyType = new propertyTypes_entity_1.PropertyType();
                                propertyType.name = key;
                                propertyType.unitPrice = '2000';
                                propertyType.entityProfileId = grsEntity.id;
                                propertyType =
                                    (yield dbManager.findOne(propertyTypes_entity_1.PropertyType, {
                                        where: { name: propertyType.name },
                                    })) || (yield dbManager.save(propertyType));
                                // create entity subscriber property
                                let entitySubscriberProperty = new entitySubscriberProperty_entity_1.EntitySubscriberProperty();
                                entitySubscriberProperty.propertyTypeId = propertyType.id;
                                entitySubscriberProperty.ownerEntitySubscriberProfileId =
                                    entitySubscriberProfile.id;
                                // Save the entity subscriber property to the database
                                entitySubscriberProperty = yield dbManager.save(entitySubscriberProperty);
                                // create property subcription units
                                const propertysubscriptionUnit = new PropertySubscriptionUnit_entity_1.PropertySubscriptionUnit();
                                propertysubscriptionUnit.propertySubscriptionId =
                                    propertySubscription.id;
                                propertysubscriptionUnit.entiySubscriberPropertyId =
                                    entitySubscriberProperty.id;
                                propertysubscriptionUnit.propertyUnits =
                                    (0, class_validator_1.isNumberString)(value) || (0, lodash_1.isNumber)(value) ? Number(value || 1) : 1;
                                propertysubscriptionUnit.propertyUnits;
                                yield dbManager.save(propertysubscriptionUnit);
                            }
                            // create billing account
                            const billingAccount = (yield dbManager.findOne(billingAccount_entity_1.BillingAccount, {
                                where: { propertySubscriptionId: propertySubscription.id },
                            })) || new billingAccount_entity_1.BillingAccount();
                            // set properties of the billing account
                            billingAccount.propertySubscriptionId = propertySubscription.id;
                            billingAccount.totalBillings =
                                ((_f = String(debtor['TotalBill'] || '')) === null || _f === void 0 ? void 0 : _f.trim()) || '0';
                            billingAccount.totalPayments =
                                ((_g = String(debtor['Total Payment'] || '')) === null || _g === void 0 ? void 0 : _g.trim()) || '0';
                            // Save the billing account to the database
                            yield dbManager.save(billingAccount);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_h && !_a && (_b = GRSDebtorListJSON_1.return)) yield _b.call(GRSDebtorListJSON_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            queryRunner.query('select 1');
        });
    }
}
exports.PropertySubscriptionSeeding1707468746527 = PropertySubscriptionSeeding1707468746527;
