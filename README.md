# Web QA Technical Skill Test Submission

## Summary
- Scenario 1 (almost completed) and the first 3 steps of Scenario 2 (incl. pre-condition part)
- Tested only works for JP region and Japanese language
- Some parts are not working as intended, and need to be fixed.

## How to run test

```
# Just run test
$ npx playwright test

# Run test with debug output
$ DEBUG=1 npx playwright test 

# Run test for JP region
$ TEST_REGION=jp npx playwright test 
```

### Environment variables
| Variable Name | Description | Default Value | Possible values |
|---------------|-------------|---------------|---------|
| TEST_REGION   | Sets the region for testing | 'jp' | jp/us |
| DEBUG         | Flag to show debug output | n/a | false |


## What have done

### Scenario 1
- Step #1 - #6
- Step #7 (Verification of the top category component)

### Scenario 2
- Pre-condition
- Step #1 - #3

### Others
- Simple debug logging
- Parameterized test for Scenario 1, so that the part of the code can be used from Scenario 2


## What have not done

### Scenario 1
- Step #7 (Verification of 2nd category component, and checkbox)

### Scenario 2
- Step #4 - #9


## What not working as intended

### Scenario 1-7, 2nd category value
- The element handle for the 2nd category did not work nor value could not be obtained.
    I wanted to use Playwright locators instead of Element Handle(EH), but it did not work even for the 1st category.
    By using element handle, I could get the value for the 1st category, that is the reason why I am using EH.
- Shared page context(fixture) for Scenario 2(between pre-condition part and other steps)
    I wanted to use shared page context for Scenario 2, but it did not work as intended
    I need to dig futher on the context managemnet feature of the Playwright.


## What I wanted to implement
- Being prepared for switching region and language, I wanted to seperate the String/text value to be used in the locators
  and verification steps, into a separate file, so that the test works for US/English too.

## Notes
I spent too much time on debugging, and understanding of the Playwright specific implementation details, so I ran out of time.
