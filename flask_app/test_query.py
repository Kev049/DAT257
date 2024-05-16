import unittest
import query_data
import os

class TestQuery(unittest.TestCase):

    def test_query_data_fail(self):
        result = query_data.query_data('not a country')
        self.assertEqual(result, '')

    def test_query_data_pass(self):
        result = query_data.query_data('Sweden')
        self.assertNotEqual(result, '')

    def test_get_plot_fail(self):
        query_data.get_plot('NotACountry')
        existence = os.path.exists(f'sveltekit_app/static/country_prod/NotACountry.png')
        self.assertFalse(existence)

    def test_get_plot_pass(self):
        query_data.get_plot('Sweden')
        existence = os.path.exists(f'sveltekit_app/static/country_prod/Sweden.png')
        self.assertTrue(existence)

    def test_get_con_fail(self):
        query_data.get_con('NotACountry')
        existence = os.path.exists(f'sveltekit_app/static/country_con/NotACountry.png')
        self.assertFalse(existence)

    def test_get_con_pass(self):
        query_data.get_con('Sweden')
        existence = os.path.exists(f'sveltekit_app/static/country_con/Sweden.png')
        self.assertTrue(existence)
        
if __name__ == "__main__":
    unittest.main()