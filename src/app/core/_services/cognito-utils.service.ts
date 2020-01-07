import { IAuthenticationDetailsData, CognitoUserPool, CognitoUserAttribute, ICognitoUserAttributeData } from "amazon-cognito-identity-js";
import { environment } from "../../../environments/environment";
import { AttributeListType } from "aws-sdk/clients/cognitoidentityserviceprovider";
import { AttributeType } from "aws-sdk/clients/elb";


export class CognitoUtils {

    public static getAuthDetails(email: string, password: string): IAuthenticationDetailsData {
        return {
            Username: email,
            Password: password,
        };
    }

    
    public static getUserPool() {
        return new CognitoUserPool(environment.AWS.COGNITO);
    }

    public static getAttribute(attrs: CognitoUserAttribute[], name: string): CognitoUserAttribute {
        return attrs.find(atr => atr.getName() === name);
    }

    public static getAttributeValue(attrs: AttributeListType, name: string, defValue: any): string {
        const attr = attrs.find(atr => atr.Name === name);
        return attr ? attr.Value : defValue;
    }

    public static getActiveAttribute(attrs: AttributeListType): boolean {
        return CognitoUtils.getAttributeValue(attrs, 'custom:active', '1') === '1';
    }

    public static createNewUserAttributes(request): CognitoUserAttribute[] {
        return [
            new CognitoUserAttribute({Name : 'name', Value : request.name }),
            new CognitoUserAttribute({Name : 'middle_name', Value : request.middle_name }),
            new CognitoUserAttribute({Name : 'email', Value : request.email }),
            new CognitoUserAttribute({Name : 'phone_number', Value : request.phone_number }),
            new CognitoUserAttribute({Name : 'updated_at', Value : '1330192800000' })          
        ];
    }

    public static createUpdatableUserAttributesData(request): AttributeListType {
        const preferedUsername = {Name : 'preferred_username', Value : request.username };
        const emailAttribute = {Name : 'email', Value : request.email };
        const emailVerifiedAttribute = {Name : 'email_verified', Value : 'true' };
        const activeAttribute = {Name : 'custom:active', Value : (request.active ? 1 : 0).toString() };
        return [
            preferedUsername, emailAttribute, emailVerifiedAttribute,
            activeAttribute
        ];
    }

    
}