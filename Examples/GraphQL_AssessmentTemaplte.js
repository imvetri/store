 function onPressSaveTemplateInformation () {
    let oTemplateInformationModel = this._oObjectPage.getModel("templateInformationModel");
    const oInformationData = oTemplateInformationModel.getData().data;
    const sMutation = this._oQueries.rcTemplates.editTemplateInformation;
    let oEditTemplateVariables = {
        assessmentTemplate: {
            id: this._oParentController._oObjectData.id,
            descriptions: [{
                short: oInformationData.description.short,
                long: oInformationData.description.long,
                language: sap.ui.getCore().getConfiguration().getLanguage().split("-")[0]
            }]
        }
    };
    this._fnCallValidation();
    if (!this._isValidForUpdate) {
        ServiceHandler.gql({
            service: "/apm/rc-assessments",
            query: sMutation,
            variables: oEditTemplateVariables,
            showBusyIndicator: true,
            successMessage: formatMessage(this._oResourceBundle.getText("assessmenttemplates.templateInformationSaveMessage.text"),
                oInformationData.displayValue)
        }).then(res => {
            const {errors: aErrors, data: oData} = res;
            if (oData) {
                let oTemplateData = JSON.parse(JSON.stringify(oData.updateAssessmentTemplateHeader));
                let oTemplateDataCopy = JSON.parse(JSON.stringify(oData.updateAssessmentTemplateHeader));
                this._oObjectPage.getModel("mTemplateHeader").setData(oTemplateDataCopy);
                this._oObjectPage.getModel("mTemplateHeader").setProperty("/calculationMethod/alphaNumeric", oTemplateDataCopy.alphaNumeric);
                this._oObjectPage.getModel("mTemplateHeaderCopy").setData(oTemplateDataCopy);
                this._oObjectPage.getModel("mTemplateHeaderCopy").setProperty("/calculationMethod/alphaNumeric", oTemplateDataCopy.alphaNumeric);
                oTemplateInformationModel.setProperty("/data", oTemplateData);
                oTemplateInformationModel.setProperty("/editButtonVisibility", true);
            }
            if (aErrors) {
                throw new Error(aErrors);
            }
        }).catch(() => {
            sap.m.MessageBox.error(this._oResourceBundle.getText("apmreusable.unexpectedError.text"));
        });
    }
}

function onPressSaveAddImpactButton () {
    let oAddImpactData = this._oAddImpactDialog.getModel("addImpact").getData();
    let sSuccessMessage = this.sSaveImpactContext === "ADDIMPACT" ? "assessmenttemplates.impactCreated.text" : "assessmenttemplates.impactModified.text";
    let iEditedImpactIndex = this.sSelectedImpactIndex !== "-1" ? this.sSelectedImpactIndex : 0;
    let oGetTemplatesQueryVariables = {
        assessmentTemplateId: this._oParentController._oObjectData.id,
        impacts: [
            {
                descriptions: [
                    { short: oAddImpactData.description.short, language: "en", long: oAddImpactData.description.long }
                ],
                type: oAddImpactData.type
            }
        ]
    };
    const oAddOrUpdateImpactMutations = this.sSaveImpactContext === "ADDIMPACT" ? this._oMutation.addImpacts : this._oMutation.updateImpacts;
    if (this.sSaveImpactContext !== "ADDIMPACT") {
        oGetTemplatesQueryVariables.impacts[0].id = oAddImpactData.id;
    }
    // Below goes the Request call to Add  or Edit Impact
    ServiceHandler.gql({
        service: "/apm/rc-assessments",
        query: oAddOrUpdateImpactMutations,
        variables: oGetTemplatesQueryVariables,
        showBusyIndicator: true,
        successMessage: this._oResourceBundle.getText(sSuccessMessage)
    }).then(res => {
        const { data: oData } = res;
        if (oData) {
            const oActionData = (this.sSaveImpactContext === "ADDIMPACT") ? oData.addImpacts : oData.updateImpacts;
            oActionData.forEach(actionStatus => {
                actionStatus.actions = false;
                actionStatus.dimensionsCount = actionStatus.dimensions.length;
            });
            this._oObjectPage.getModel("mImpactList").setProperty("/impacts", oActionData);
            //check for Release AT
            this.oView.getModel("mTemplateHeader").setProperty("/impacts", oActionData);
            this._oObjectPage.getModel("mImpactList").setProperty("/bResetImpactSelectionsAndReorder", true);
            this._oAddImpactDialog.close();
            if (this.sSaveImpactContext === "ADDIMPACT") {
                this.oView.getModel("mImpactList").setProperty("/mResetImpactWeightingMessage", true);
            }
            //Object preperation for newly created Impact or editing existing Impact in list(Numeric)
            let oImpactDataModel = this.getView().getModel("mImpactList").getData().impacts;
            this.oCreatedOrEditImpactObject = {
                order: this.sSaveImpactContext !== "ADDIMPACT" ? iEditedImpactIndex : oImpactDataModel.length - 1,
                action: this.sSaveImpactContext
            };
            if (this.sSaveImpactContext === "ADDIMPACT" && !!oData.addImpacts.length && this.getView().getModel("mTemplateHeader").getData().alphaNumeric) {
                let oImpactDimension = oData.addImpacts.find(obj => obj.dimensions.length > 0);
                if (!oImpactDimension) {
                    let aDimension = [
                        {
                            description: { short: "", long: "" },
                            displayOrder: 1
                        },
                        {
                            description: { short: "", long: "" },
                            displayOrder: 2
                        }
                    ];
                    this.oView.getModel("mDimensionList").setProperty("/dimensions", aDimension);
                    this.oView.getModel("mDimensionList").setProperty("/bEditDimension", true);
                }

            }
            this.oReorderHelpers.impacts.setCurrentAssessmentId("");
        }
    }).catch(() => sap.m.MessageBox.error(this._oResourceBundle.getText("apmreusable.unexpectedError.text")));
}

 function _updateImpactsWeights (sAssessmentTemplateId, aImpacts) {
    const sEditWeightsQuery = this._oMutation.updateImpacts;
    aImpacts = aImpacts.map(({ id, weighting }) => ({ id, weighting }));
    const oEditWeightsQueryVariables = {
        assessmentTemplateId: sAssessmentTemplateId,
        impacts: aImpacts
    };
    ServiceHandler.gql({
        service: "/apm/rc-assessments",
        query: sEditWeightsQuery,
        variables: oEditWeightsQueryVariables,
        showBusyIndicator: true,
        successMessage: this._oResourceBundle.getText("assessmenttemplates.successfulWeightingMessage.text")
    }).then((res) => {
        const { errors: aErrors, data: oData } = res;
        if (oData) {
            oData.updateImpacts.forEach(actionStatus => {
                actionStatus.actions = false;
                actionStatus.dimensionsCount = actionStatus.dimensions.length;
            });
            this._oObjectPage.getModel("mImpactList").setProperty("/impacts", oData.updateImpacts);
        }
        if (aErrors) {
            throw new Error(aErrors);
        }
    }).catch(() => sap.m.MessageBox.error(this._oResourceBundle.getText("apmreusable.unexpectedError.text")));
},

function _addDimensionsOnServer() {
    const mUpdatedDimensions = this.oView.getModel("mDimensionList").getProperty("/dimensions");
    // id will not be there for new dimensions
    const aToBeAdded = mUpdatedDimensions.filter(oDimension => {
        return !oDimension.id;
    }).map(oDimensionToAdd => {
        oDimensionToAdd.descriptions.push(oDimensionToAdd.description);
        return {
            descriptions: oDimensionToAdd.descriptions,
            displayOrder: oDimensionToAdd.displayOrder,
            weighting: parseFloat(oDimensionToAdd.weighting)
        };
    });
    // Call mutation for add dimension, if new dimensions are there to be persisted
    let oImpactModel = this.oView.getModel("mImpactList").getData();
    if (aToBeAdded.length > 0) {
        let oAddDimensionQueryVariables = {
            assessmentTemplateId: oImpactModel.id,
            impactId: oImpactModel.impacts[this.sSelectedImpactIndex].id,
            dimensions: aToBeAdded
        };
        ServiceHandler.gql({
            service: "/apm/rc-assessments",
            query: this._oQueries.rcTemplates.addDimensionMutation,
            variables: oAddDimensionQueryVariables,
            showBusyIndicator: true
        }).then(res => {
            const { errors: aErrors, data: oData } = res;
            if (oData) {
                this.oView.getModel("mDimensions").setProperty("/dimensions", oData.addDimensions);
                this.oView.getModel("mDimensions").setProperty("/dimensionsCount", oData.addDimensions.length);
                let sDimensionPathInImpactModel = "/impacts/" + this.sSelectedImpactIndex;
                this.oView.getModel("mImpactList").setProperty(sDimensionPathInImpactModel + "/dimensions", oData.addDimensions);
                this.oView.getModel("mImpactList").setProperty(sDimensionPathInImpactModel + "/dimensionsCount", oData.addDimensions.length);
                this.oView.getModel("mImpactList").updateBindings(true);
                this.oView.getModel("mDimensionList").setProperty("/bEditDimension", false);
            }
            if (aErrors) {
                this.oView.getModel("mDimensionList").setProperty("/bEditDimension", true);
                throw new Error(aErrors);
            }
        }).catch(() => sap.m.MessageBox.error(this._oResourceBundle.getText("apmreusable.unexpectedError.text")));
    }
}

function onPressAlphanumericSaveAndUpdateDimension () {
    let aDimensions = this._fnGetDimensionPayload();
    const aImpactData = this.getView().getModel("mImpactList").getData();
    let sAlphaImpactId = aImpactData.impacts[0].id;
    //check and trigger deletion of scales
    if (this.aScalesId && this.aScalesId.length) {
        await this._removeScales(this.aScalesId, sAlphaImpactId);
    }
    let addDimensionQueryVariables = {
        assessmentTemplateId: aImpactData.id,
        impactId: sAlphaImpactId,
        dimensions: aDimensions
    };
    let sMutation = this._oQueries.rcTemplates.updateDimensionMutation;
    const { data: oData } = await ServiceHandler.gql({
        service: "/apm/rc-assessments",
        query: sMutation,
        variables: addDimensionQueryVariables,
        showBusyIndicator: true
    });
    if (oData) {
        this._oObjectPage.getModel("mDimensionList").setProperty("/dimensions", oData.updateDimensions);
        this._oObjectPage.getModel("mDimensionList").setProperty("/bEditDimension", false);
        this._oObjectPage.getModel("mImpactList").setProperty("/impacts/0/dimensions/", oData.updateDimensions);
        this._oObjectPage.getModel("mImpactList").updateBindings(true);
    }
}

function _removeScales (aScalesId, sImpactId) {
    let oDeleteScalesQueryVariables = {
        assessmentTemplateId: this._oParentController._oObjectData.id,
        impactId: sImpactId,
        scaleIds: aScalesId
    };
    await ServiceHandler.gql({
        service: this._oApmConstants.serviceUrls.rcassessmentBaseUrl.url,
        query: this._oQueries.rcTemplates.removeScales,
        variables: oDeleteScalesQueryVariables,
        showBusyIndicator: true
    });
}

 function onPressThresholdsSaveButton () {
    const aThresholds = JSON.parse(JSON.stringify(this.oView.getModel("mThreshold").getProperty("/thresholdData/thresholds")));
    aThresholds.map(oThreshold => {
        oThreshold.actionCode = oThreshold.action.code;
        oThreshold.criticalityCode = oThreshold.criticality.code;
        delete oThreshold.action;
        delete oThreshold.criticality;
        delete oThreshold.valueStates;
        return oThreshold;
    });

    let oSetOverallNumericThresholdsQueryVariables = {
        assessmentTemplateId: this.oView.getModel("mTemplateHeader").getData().id,
        thresholds: aThresholds
    };
    this.oView.getModel("mThreshold").setProperty("/bEditThreshold", false);
    const { errors: aErrors, data: oData } = await ServiceHandler.gql({
        service: APMConstants.serviceUrls.rcassessmentBaseUrl.url,
        query: this._oAPMQueries.setOverallNumericThresholds,
        variables: oSetOverallNumericThresholdsQueryVariables,
        showBusyIndicator: true
    });
    if (oData) {
        this.oView.getModel("mThreshold").setProperty("/thresholdData/thresholds", oData.setOverallNumericThresholds);
        this.oView.getModel("mThreshold").setProperty("/bEditThreshold", false);
        // need to check thresholds for releasing AT
        this.oView.getModel("mTemplateHeader").setProperty("/thresholds", oData.setOverallNumericThresholds);
        this.oView.getModel("mTemplateHeader").updateBindings(true);
        this.oView.getModel("mThreshold").setProperty("/bCancelDisabled", false);
    }
    if (aErrors) {
        this.oView.getModel("mThreshold").setProperty("/bEditThreshold", true);
        throw new Error(aErrors);
    }
}