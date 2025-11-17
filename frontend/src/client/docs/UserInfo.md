
# UserInfo


## Properties

Name | Type
------------ | -------------
`userName` | string
`claims` | [Array&lt;Claim&gt;](Claim.md)

## Example

```typescript
import type { UserInfo } from ''

// TODO: Update the object below with actual values
const example = {
  "userName": null,
  "claims": null,
} satisfies UserInfo

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UserInfo
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


