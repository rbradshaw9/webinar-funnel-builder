// Test script for parsers
// Run with: npx tsx test-parsers.ts

import { parseInfusionsoftForm } from './lib/parsers/infusionsoft';
import { parseWebinarFuelWidget } from './lib/parsers/webinarfuel';

console.log('🧪 Testing Parsers\n');

// Test Infusionsoft Parser
console.log('1. Testing Infusionsoft Parser...');
const testInfusionsoftHTML = `
<form method="POST" action="https://example.infusionsoft.com/app/form/process/abc123">
  <input type="hidden" name="inf_form_xid" value="test123" />
  <input type="hidden" name="inf_form_name" value="Test Webinar" />
  <input type="text" name="inf_field_FirstName" placeholder="First Name" />
  <input type="text" name="inf_field_LastName" placeholder="Last Name" />
  <input type="email" name="inf_field_Email" placeholder="Email" />
  <input type="tel" name="inf_field_Phone1" placeholder="Phone" />
  <input type="checkbox" name="inf_custom_SMSOptInWebinar" value="1" />
  <button type="submit">Register</button>
</form>
`;

try {
  const infusionsoftResult = parseInfusionsoftForm(testInfusionsoftHTML);
  console.log('✅ Infusionsoft parser successful');
  console.log('   Action URL:', infusionsoftResult.actionUrl);
  console.log('   XID:', infusionsoftResult.xid);
  console.log('   Has SMS Consent:', infusionsoftResult.hasSMSConsent);
  console.log('   Field Mappings:', Object.keys(infusionsoftResult.fieldMappings).join(', '));
} catch (error: any) {
  console.log('❌ Infusionsoft parser failed:', error.message);
}

console.log('');

// Test WebinarFuel Parser
console.log('2. Testing WebinarFuel Parser...');
const testWebinarFuelHTML = `
<script src="https://app.webinarfuel.com/widgets/123/456/789.js"></script>
`;

try {
  const webinarfuelResult = parseWebinarFuelWidget(
    testWebinarFuelHTML,
    'https://app.webinarfuel.com/register/test-webinar/123/456'
  );
  console.log('✅ WebinarFuel parser successful');
  console.log('   Webinar ID:', webinarfuelResult.webinarId);
  console.log('   Widget ID:', webinarfuelResult.widgetId);
  console.log('   Version ID:', webinarfuelResult.versionId);
  console.log('   Widget Type:', webinarfuelResult.widgetType);
} catch (error: any) {
  console.log('❌ WebinarFuel parser failed:', error.message);
}

console.log('');
console.log('✨ Parser tests complete!');
