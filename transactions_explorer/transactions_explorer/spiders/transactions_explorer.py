from scrapy.contrib.spiders import CrawlSpider, Rule
from scrapy.contrib.linkextractors.sgml import SgmlLinkExtractor
from scrapy.selector import HtmlXPathSelector
from scrapy.item import Item
from scrapy.spider import BaseSpider

class TxExplorerSpider(CrawlSpider):
        name = "transactions-explorer"
        allowed_domains = ["transactionsexplorer.cabinetoffice.gov.uk"]
        start_urls = ["http://transactionsexplorer.cabinetoffice.gov.uk/"]

        # allow=() is used to match all links
        rules = [
        Rule(SgmlLinkExtractor(allow=()), follow=True),
        Rule(SgmlLinkExtractor(allow=()), callback='parse_item')
        ]

        def parse_item(self, response):
                x = HtmlXPathSelector(response)

                filename = "transactions-explorer-urls.txt"
                open(filename, 'ab').write(response.url)
