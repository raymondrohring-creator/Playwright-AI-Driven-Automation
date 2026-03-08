# Test Plan for Cloudberry Store

## Application Overview

This test plan covers the functional testing of the Cloudberry Store e-commerce website (https://cloudberrystore.services/), an OpenCart-based platform. The site includes product categories, search functionality, shopping cart, checkout process, user account management, and informational pages. Tests are designed to ensure a smooth user experience for browsing, purchasing, and account interactions.

## Test Scenarios

### 1. Homepage and Navigation

**Seed:** `tests/seed.spec.ts`

#### 1.1. Verify homepage loads correctly

**File:** `tests/homepage-navigation.spec.ts`

**Steps:**
  1. Navigate to https://cloudberrystore.services/
    - expect: Page title is 'Your store of fun'
    - expect: Header elements (logo, search, cart) are visible
    - expect: Navigation menu with categories is displayed
    - expect: Featured products section shows 4 products
  2. Interact with header elements
    - expect: Currency dropdown is functional
    - expect: Phone number link is present
    - expect: My Account dropdown expands with options

#### 1.2. Test main navigation menu

**File:** `tests/homepage-navigation.spec.ts`

**Steps:**
  1. Hover and click on navigation menu items
    - expect: Hovering over 'Laptops & Notebooks' shows sub-menu
    - expect: Clicking a category navigates to correct page
  2. Navigate through multiple categories
    - expect: Breadcrumbs update correctly
    - expect: Page title reflects category

#### 1.3. Test footer links

**File:** `tests/homepage-navigation.spec.ts`

**Steps:**
  1. Click on each footer link (About Us, Contact, etc.)
    - expect: All footer links are accessible
    - expect: Information pages load without errors
  2. Click on 'Powered By OpenCart' link
    - expect: OpenCart link opens in new tab

### 2. Product Browsing and Details

**Seed:** `tests/seed.spec.ts`

#### 2.1. Browse category products

**File:** `tests/product-browsing.spec.ts`

**Steps:**
  1. Navigate to a category with products (e.g., Laptops & Notebooks)
    - expect: Products are listed with image, name, price
    - expect: Pagination works for multiple pages
    - expect: Sort and Show options function
  2. Click on sub-categories and refine options
    - expect: Sub-category links work
    - expect: Refine Search filters products

#### 2.2. View product details

**File:** `tests/product-browsing.spec.ts`

**Steps:**
  1. Click on a product from category or homepage
    - expect: Product page shows full description, specifications, reviews
    - expect: Image gallery is functional
    - expect: Price, availability, and ratings are displayed
  2. Verify product action buttons
    - expect: Add to Cart, Wish List, Compare buttons are present

#### 2.3. Test product actions

**File:** `tests/product-browsing.spec.ts`

**Steps:**
  1. Add product to cart from product page
    - expect: Success message appears
    - expect: Cart count updates
  2. Add product to wish list
    - expect: Wish List count increases
  3. Click Compare this Product
    - expect: Product added to compare list

### 3. Search Functionality

**Seed:** `tests/seed.spec.ts`

#### 3.1. Basic search

**File:** `tests/search.spec.ts`

**Steps:**
  1. Enter a product name in search box and click search
    - expect: Search results page loads
    - expect: Relevant products are displayed
  2. Search for non-existent product
    - expect: No results message for invalid search

#### 3.2. Advanced search options

**File:** `tests/search.spec.ts`

**Steps:**
  1. Use advanced search criteria
    - expect: Search in descriptions checkbox works
    - expect: Category filter narrows results
  2. Search within specific category
    - expect: Search results match selected category

#### 3.3. Search edge cases

**File:** `tests/search.spec.ts`

**Steps:**
  1. Search with partial keywords
    - expect: Partial matches are found
  2. Search with symbols or numbers
    - expect: Special characters are handled

### 4. Shopping Cart

**Seed:** `tests/seed.spec.ts`

#### 4.1. Add and view cart

**File:** `tests/cart.spec.ts`

**Steps:**
  1. Add product to cart and open cart dropdown
    - expect: Cart dropdown shows added item
    - expect: Total price is correct
  2. Click 'View Cart' from dropdown
    - expect: Full cart page displays item details, quantities, totals

#### 4.2. Update cart

**File:** `tests/cart.spec.ts`

**Steps:**
  1. Change quantity in cart
    - expect: Quantity updates correctly
    - expect: Total recalculates
  2. Click remove button on cart item
    - expect: Item is removed from cart

#### 4.3. Cart edge cases

**File:** `tests/cart.spec.ts`

**Steps:**
  1. Add item, navigate away, return to cart
    - expect: Cart persists across pages
  2. Remove all items from cart
    - expect: Empty cart message appears
  3. Attempt to add excessive quantity
    - expect: Maximum quantity limits enforced

### 5. Checkout Process

**Seed:** `tests/seed.spec.ts`

#### 5.1. Guest checkout initiation

**File:** `tests/checkout.spec.ts`

**Steps:**
  1. Click Checkout with items in cart
    - expect: Checkout page loads with personal details form
  2. Attempt to continue without filling required fields
    - expect: Form fields are required

#### 5.2. Complete guest checkout

**File:** `tests/checkout.spec.ts`

**Steps:**
  1. Fill personal details and continue
    - expect: Shipping address form appears
  2. Fill shipping address and continue
    - expect: Payment method selection available
  3. Select payment method and confirm order
    - expect: Order confirmation page appears

#### 5.3. Registered checkout

**File:** `tests/checkout.spec.ts`

**Steps:**
  1. Select Register Account option
    - expect: Login form appears
  2. Fill registration details and continue
    - expect: Account created successfully
  3. Proceed through checkout as registered user
    - expect: Checkout completes for registered user

### 6. Account Management

**Seed:** `tests/seed.spec.ts`

#### 6.1. User registration

**File:** `tests/account.spec.ts`

**Steps:**
  1. Navigate to account registration
    - expect: Registration form is accessible
  2. Fill and submit registration form
    - expect: Success message for valid registration
  3. Submit with missing or invalid fields
    - expect: Error messages for invalid data

#### 6.2. User login

**File:** `tests/account.spec.ts`

**Steps:**
  1. Navigate to login page
    - expect: Login page loads
  2. Enter valid credentials
    - expect: User logged in successfully
  3. Enter wrong username/password
    - expect: Error for invalid credentials

#### 6.3. Wish list management

**File:** `tests/account.spec.ts`

**Steps:**
  1. View wish list after adding products
    - expect: Wish list page shows added items
  2. Remove item from wish list
    - expect: Item removed from wish list

#### 6.4. Order history

**File:** `tests/account.spec.ts`

**Steps:**
  1. View order history after placing order
    - expect: Order history displays past orders
  2. Click on an order for details
    - expect: Order details are correct

### 7. Information Pages

**Seed:** `tests/seed.spec.ts`

#### 7.1. Contact page

**File:** `tests/information.spec.ts`

**Steps:**
  1. Navigate to Contact Us page
    - expect: Contact form is present
  2. Fill and submit contact form
    - expect: Form submission succeeds

#### 7.2. Other info pages

**File:** `tests/information.spec.ts`

**Steps:**
  1. Visit About Us, Privacy Policy, Terms & Conditions
    - expect: Content loads correctly
  2. Click internal links on info pages
    - expect: Links within pages work
