# BackEndForFrontendApi

All URIs are relative to *https://localhost:7010*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**userBackendoneClaimsGet**](BackEndForFrontendApi.md#userbackendoneclaimsget) | **GET** /user/backendone/claims |  |
| [**userInfoGet**](BackEndForFrontendApi.md#userinfoget) | **GET** /user/info |  |



## userBackendoneClaimsGet

> Array&lt;Claim&gt; userBackendoneClaimsGet()



### Example

```ts
import {
  Configuration,
  BackEndForFrontendApi,
} from '';
import type { UserBackendoneClaimsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new BackEndForFrontendApi();

  try {
    const data = await api.userBackendoneClaimsGet();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;Claim&gt;**](Claim.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## userInfoGet

> UserInfo userInfoGet()



### Example

```ts
import {
  Configuration,
  BackEndForFrontendApi,
} from '';
import type { UserInfoGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new BackEndForFrontendApi();

  try {
    const data = await api.userInfoGet();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**UserInfo**](UserInfo.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

